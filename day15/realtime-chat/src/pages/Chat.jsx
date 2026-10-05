import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

import {
  addMessage,
  setActiveChat,
  setChats,
  setMessages,
  setUsers,
} from "../redux/chatSlice";

import {
  createChat,
  getChatterUsers,
  subscribeToUserChats,
} from "../services/chatService";

import {
  connectWebSocket,
  requestChatMessages,
  subscribeToConnection,
  subscribeToWebSocket,
} from "../services/websocketService";

const Chat = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const {
    users,
    chats,
    activeChat,
    messages,
  } = useSelector(
    (state) => state.chat
  );

  /*
   * ==================================================
   * ACTIVE CHAT REF
   * ==================================================
   *
   * We update this during render instead of inside
   * useEffect.
   *
   * This guarantees that the WebSocket listener always
   * has the latest active chat ID.
   */

  const activeChatIdRef = useRef(null);

  activeChatIdRef.current =
    activeChat?.id ||
    activeChat?.chatId ||
    null;

  /*
   * ==================================================
   * LOAD USERS
   * ==================================================
   */

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    const loadUsers = async () => {
      try {
        const fetchedUsers =
          await getChatterUsers(
            currentUser.uid
          );

        dispatch(
          setUsers(fetchedUsers)
        );
      } catch (error) {
        console.error(
          "Failed to load users:",
          error
        );
      }
    };

    loadUsers();
  }, [
    currentUser?.uid,
    dispatch,
  ]);

  /*
   * ==================================================
   * SUBSCRIBE TO FIRESTORE CHAT LIST
   * ==================================================
   *
   * This is responsible for keeping the sidebar
   * updated.
   */

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    const unsubscribe =
      subscribeToUserChats(
        currentUser.uid,
        (fetchedChats) => {
          console.log(
            "FIRESTORE CHATS UPDATED:",
            fetchedChats
          );

          dispatch(
            setChats(fetchedChats)
          );
        }
      );

    return () => {
      unsubscribe?.();
    };
  }, [
    currentUser?.uid,
    dispatch,
  ]);

  /*
   * ==================================================
   * CONNECT TO WEBSOCKET
   * ==================================================
   */

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    let cancelled = false;

    const connect = async () => {
      try {
        await connectWebSocket();

        if (!cancelled) {
          console.log(
            "Chat connected to WebSocket"
          );
        }
      } catch (error) {
        console.error(
          "Failed to connect WebSocket:",
          error
        );
      }
    };

    connect();

    return () => {
      cancelled = true;
    };
  }, [
    currentUser?.uid,
  ]);

  /*
   * ==================================================
   * WEBSOCKET CONNECTION STATUS
   * ==================================================
   */

  useEffect(() => {
    const unsubscribe =
      subscribeToConnection(
        (connected) => {
          console.log(
            "WebSocket connection status:",
            connected
          );
        }
      );

    return unsubscribe;
  }, []);

  /*
   * ==================================================
   * REALTIME MESSAGE LISTENER
   * ==================================================
   *
   * There are two message events:
   *
   * message_sent
   *   -> message sent by this user
   *
   * new_message
   *   -> message received from another user
   *
   * Both need to be added to Redux immediately.
   */

  useEffect(() => {
    const unsubscribe =
      subscribeToWebSocket(
        (data) => {
          console.log(
            "WEBSOCKET EVENT:",
            data
          );

          /*
           * Ignore non-message events.
           */

          if (
            data.type !==
              "new_message" &&
            data.type !==
              "message_sent"
          ) {
            return;
          }

          const message =
            data.message;

          if (!message) {
            console.warn(
              "Message event had no message:",
              data
            );

            return;
          }

          const currentChatId =
            activeChatIdRef.current;

          console.log(
            "========================================"
          );

          console.log(
            "REALTIME MESSAGE RECEIVED"
          );

          console.log(
            "Message:",
            message
          );

          console.log(
            "Message chat ID:",
            message.chatId
          );

          console.log(
            "Active chat ID:",
            currentChatId
          );

          console.log(
            "Message event:",
            data.type
          );

          console.log(
            "========================================"
          );

          /*
           * Only put the message directly into the
           * visible message list if it belongs to
           * the currently open chat.
           */

          if (
            message.chatId ===
            currentChatId
          ) {
            console.log(
              "ADDING REALTIME MESSAGE TO REDUX"
            );

            dispatch(
              addMessage(message)
            );

            return;
          }

          /*
           * Message belongs to another conversation.
           *
           * The Firestore chat subscription will still
           * update the sidebar.
           */

          console.log(
            "MESSAGE IS FOR ANOTHER CHAT"
          );
        }
      );

    return unsubscribe;
  }, [dispatch]);

  /*
   * ==================================================
   * GET OTHER USER
   * ==================================================
   *
   * ChatSidebar expects this function.
   */

  const getOtherUser = (chat) => {
    if (
      !chat ||
      !Array.isArray(
        chat.participants
      ) ||
      !currentUser?.uid
    ) {
      return null;
    }

    const otherUserId =
      chat.participants.find(
        (id) =>
          id !== currentUser.uid
      );

    if (!otherUserId) {
      return null;
    }

    return (
      users.find(
        (user) =>
          user.uid ===
          otherUserId
      ) || null
    );
  };

  /*
   * ==================================================
   * SELECT EXISTING CHAT
   * ==================================================
   */

  const handleSelectChat =
    async (chat) => {
      if (!chat) {
        return;
      }

      console.log(
        "SELECTED CHAT:",
        chat
      );

      /*
       * Some parts of the app may call the
       * identifier `id`, while others may call it
       * `chatId`.
       *
       * Normalize it here.
       */

      const normalizedChat = {
        ...chat,

        id:
          chat.id ||
          chat.chatId,
      };

      if (!normalizedChat.id) {
        console.error(
          "Selected chat has no ID:",
          chat
        );

        return;
      }

      /*
       * Make sure the other user is attached.
       */

      if (
        !normalizedChat.otherUser
      ) {
        normalizedChat.otherUser =
          getOtherUser(
            normalizedChat
          );
      }

      console.log(
        "NORMALIZED CHAT:",
        normalizedChat
      );

      /*
       * Immediately change the active chat.
       */

      dispatch(
        setActiveChat(
          normalizedChat
        )
      );

      try {
        console.log(
          "REQUESTING HISTORY FOR:",
          normalizedChat.id
        );

        const history =
          await requestChatMessages(
            normalizedChat.id
          );

        console.log(
          "HISTORY RETURNED:",
          history
        );

        /*
         * chatSlice.setMessages() merges this
         * history with any realtime messages that
         * arrived while history was loading.
         */

        dispatch(
          setMessages(
            history
          )
        );
      } catch (error) {
        console.error(
          "Failed to load chat history:",
          error
        );

        dispatch(
          setMessages([])
        );
      }
    };

  /*
   * ==================================================
   * SELECT USER / CREATE CHAT
   * ==================================================
   */

  const handleSelectUser =
    async (user) => {
      if (
        !currentUser?.uid ||
        !user?.uid
      ) {
        return;
      }

      try {
        console.log(
          "OPENING CHAT WITH USER:",
          user
        );

        const chat =
          await createChat(
            currentUser.uid,
            user.uid
          );

        const normalizedChat = {
          ...chat,

          id:
            chat.id ||
            chat.chatId,

          otherUser: user,
        };

        await handleSelectChat(
          normalizedChat
        );
      } catch (error) {
        console.error(
          "Failed to create/open chat:",
          error
        );
      }
    };

  /*
   * ==================================================
   * ADD USER INFORMATION TO CHAT OBJECTS
   * ==================================================
   *
   * Firestore stores participant IDs.
   *
   * The UI needs the actual user object.
   */

  const chatsWithUsers =
    chats.map((chat) => {
      const otherUser =
        chat.otherUser ||
        getOtherUser(chat);

      return {
        ...chat,

        id:
          chat.id ||
          chat.chatId,

        otherUser,
      };
    });

  /*
   * ==================================================
   * ACTIVE CHAT WITH USER INFORMATION
   * ==================================================
   */

  const activeChatWithUser =
    activeChat
      ? {
          ...activeChat,

          id:
            activeChat.id ||
            activeChat.chatId,

          otherUser:
            activeChat.otherUser ||
            getOtherUser(
              activeChat
            ),
        }
      : null;

  /*
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#2B2129] text-[#E5D1B8]">
      <ChatSidebar
        users={users}
        chats={chatsWithUsers}
        activeChat={
          activeChatWithUser
        }
        currentUserId={
          currentUser?.uid
        }
        getOtherUser={
          getOtherUser
        }
        onSelectChat={
          handleSelectChat
        }
        onSelectUser={
          handleSelectUser
        }
      />

      <main className="flex min-w-0 flex-1 flex-col bg-[#2B2129]">
        {activeChatWithUser ? (
          <>
            <ChatHeader
              chat={
                activeChatWithUser
              }
            />

            <MessageList
              messages={messages}
              currentUserId={
                currentUser?.uid
              }
            />

            <MessageInput
              chat={
                activeChatWithUser
              }
              currentUserId={
                currentUser?.uid
              }
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5D1B8]/5 text-2xl">
                💬
              </div>

              <h2 className="text-lg font-semibold text-[#E5D1B8]">
                Select a conversation
              </h2>

              <p className="mt-2 text-sm text-[#C2956E]">
                Choose someone from your
                conversations to start
                chatting.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;