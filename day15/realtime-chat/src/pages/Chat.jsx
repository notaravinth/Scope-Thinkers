import { useEffect, useState } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

import {
  setUsers,
  setChats,
  setActiveChat,
  setMessages,
  setChatLoading,
  addMessage,
} from "../redux/chatSlice";

import {
  getChatterUsers,
  createChat,
  subscribeToUserChats,
} from "../services/chatService";

import {
  connectWebSocket,
  subscribeToWebSocket,
  requestChatMessages,
} from "../services/websocketService";

const Chat = () => {
  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth
  );

  const {
    users,
    chats,
    activeChat,
    messages,
    loading,
  } = useSelector(
    (state) => state.chat
  );

  const [search, setSearch] =
    useState("");

  /*
   * Load users
   */
  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const loadUsers = async () => {
      try {
        dispatch(
          setChatLoading(true)
        );

        const usersData =
          await getChatterUsers(
            user.uid
          );

        dispatch(
          setUsers(usersData)
        );
      } catch (error) {
        console.error(
          "Failed to load users:",
          error
        );
      } finally {
        dispatch(
          setChatLoading(false)
        );
      }
    };

    loadUsers();
  }, [user?.uid, dispatch]);

  /*
   * Subscribe to chats.
   *
   * This keeps the sidebar updated.
   */
  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const unsubscribe =
      subscribeToUserChats(
        user.uid,
        (chatData) => {
          dispatch(
            setChats(chatData)
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, [user?.uid, dispatch]);

  /*
   * Connect WebSocket
   */
  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const connect = async () => {
      try {
        await connectWebSocket();

        console.log(
          "Chat connected to WebSocket"
        );
      } catch (error) {
        console.error(
          "WebSocket connection failed:",
          error
        );
      }
    };

    connect();
  }, [user?.uid]);

  /*
   * WebSocket listener
   *
   * IMPORTANT:
   * activeChat is included in the dependency
   * array so the listener always knows which
   * conversation is currently open.
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
           * Authentication
           */
          if (
            data.type ===
            "authenticated"
          ) {
            return;
          }

          /*
           * Message history
           *
           * requestChatMessages()
           * handles the actual response.
           */
          if (
            data.type ===
            "messages_history"
          ) {
            console.log(
              "HISTORY EVENT:",
              data
            );

            return;
          }

          /*
           * Message sent by us
           */
          if (
            data.type ===
            "message_sent"
          ) {
            const message =
              data.message;

            console.log(
              "MESSAGE SENT:",
              message
            );

            console.log(
              "MESSAGE CHAT ID:",
              message.chatId
            );

            console.log(
              "ACTIVE CHAT ID:",
              activeChat?.id
            );

            if (
              message.chatId ===
              activeChat?.id
            ) {
              console.log(
                "ADDING SENT MESSAGE"
              );

              dispatch(
                addMessage(message)
              );
            }

            return;
          }

          /*
           * New incoming message
           */
          if (
            data.type ===
            "new_message"
          ) {
            const message =
              data.message;

            console.log(
              "========== NEW MESSAGE =========="
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
              activeChat?.id
            );

            if (
              message.chatId ===
              activeChat?.id
            ) {
              console.log(
                "ADDING INCOMING MESSAGE TO UI"
              );

              dispatch(
                addMessage(message)
              );
            } else {
              console.log(
                "MESSAGE IS FOR ANOTHER CHAT"
              );
            }

            return;
          }

          /*
           * Server error
           */
          if (
            data.type === "error"
          ) {
            console.error(
              "WebSocket server error:",
              data.message
            );
          }
        }
      );

    return () => {
      unsubscribe();
    };
  }, [
    activeChat?.id,
    dispatch,
  ]);

  /*
   * Load history whenever the
   * active chat changes.
   */
  useEffect(() => {
    if (!activeChat?.id) {
      dispatch(
        setMessages([])
      );

      return;
    }

    const chatId =
      activeChat.id;

    const loadMessages =
      async () => {
        console.log(
          "REQUESTING HISTORY FOR:",
          chatId
        );

        dispatch(
          setMessages([])
        );

        try {
          const history =
            await requestChatMessages(
              chatId
            );

          /*
           * Make sure the user hasn't
           * switched to another chat.
           */
          if (
            activeChat?.id !==
            chatId
          ) {
            return;
          }

          console.log(
            "HISTORY RETURNED:",
            history
          );

          dispatch(
            setMessages(history)
          );
        } catch (error) {
          console.error(
            "Failed to load messages:",
            error
          );
        }
      };

    loadMessages();
  }, [
    activeChat?.id,
    dispatch,
  ]);

  /*
   * Select a user
   */
  const handleSelectUser =
    async (selectedUser) => {
      if (!user?.uid) {
        return;
      }

      try {
        const chat =
          await createChat(
            user.uid,
            selectedUser.uid
          );

        dispatch(
          setMessages([])
        );

        dispatch(
          setActiveChat({
            ...chat,
            otherUser:
              selectedUser,
          })
        );
      } catch (error) {
        console.error(
          "Failed to open chat:",
          error
        );
      }
    };

  /*
   * Get the other participant
   */
  const getOtherUser = (
    chat
  ) => {
    const otherUserId =
      chat.participants.find(
        (id) =>
          id !== user.uid
      );

    return users.find(
      (item) =>
        item.uid === otherUserId
    );
  };

  /*
   * Select existing chat
   */
  const handleSelectChat = (
    chat
  ) => {
    const otherUser =
      getOtherUser(chat);

    if (!otherUser) {
      return;
    }

    dispatch(
      setMessages([])
    );

    dispatch(
      setActiveChat({
        ...chat,
        otherUser,
      })
    );
  };

  /*
   * Search users
   */
  const filteredUsers =
    users.filter((item) =>
      item.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div className="flex h-screen overflow-hidden bg-[#2B2129] text-[#E5D1B8]">
      <ChatSidebar
        currentUser={user}
        users={filteredUsers}
        chats={chats}
        activeChat={activeChat}
        search={search}
        setSearch={setSearch}
        onSelectUser={
          handleSelectUser
        }
        onSelectChat={
          handleSelectChat
        }
        getOtherUser={
          getOtherUser
        }
        loading={loading}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        {activeChat ? (
          <>
            <ChatHeader
              chat={activeChat}
            />

            <MessageList
              messages={messages}
              currentUserId={
                user.uid
              }
            />

            <MessageInput
              chat={activeChat}
              currentUserId={
                user.uid
              }
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#C2956E] bg-[#E5D1B8]/5 text-2xl">
                💬
              </div>

              <h2 className="text-xl font-semibold text-[#E5D1B8]">
                Welcome to Chatter
              </h2>

              <p className="mt-2 text-sm text-[#C2956E]">
                Select someone to
                start a
                conversation.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;