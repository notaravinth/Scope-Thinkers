import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";

import {
  addMessage,
  setActiveChat,
  setChatHistory,
  setChats,
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
  subscribeToWebSocket,
} from "../services/webSocketService";

const Chat = () => {
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.auth.user);

  const { users, chats, activeChat, messagesByChatId } = useSelector(
    (state) => state.chat,
  );

  const activeChatId = activeChat?.id || null;
  const messages = activeChatId
    ? messagesByChatId[activeChatId] || []
    : [];

  useEffect(() => {
    if (!currentUser?.uid) return;

    let cancelled = false;

    const loadUsers = async () => {
      try {
        const result = await getChatterUsers(currentUser.uid);

        if (!cancelled) {
          dispatch(setUsers(result));
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.uid, dispatch]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToUserChats(
      currentUser.uid,
      (result) => dispatch(setChats(result)),
    );

    return unsubscribe;
  }, [currentUser?.uid, dispatch]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    connectWebSocket().catch((error) => {
      console.error("Failed to connect WebSocket:", error);
    });
  }, [currentUser?.uid]);

  useEffect(() => {
    const unsubscribe = subscribeToWebSocket((data) => {
      if (data.type !== "new_message" && data.type !== "message_sent") {
        return;
      }

      if (!data.message?.chatId) {
        return;
      }

      console.log("REALTIME MESSAGE:", data.message);

      // Store every realtime message by its chat ID.
      // No active-chat comparison is necessary.
      dispatch(addMessage(data.message));
    });

    return unsubscribe;
  }, [dispatch]);

  const getOtherUser = (chat) => {
    if (!chat?.participants || !currentUser?.uid) return null;

    const otherUserId = chat.participants.find(
      (id) => id !== currentUser.uid,
    );

    return users.find((user) => user.uid === otherUserId) || null;
  };

  const normalizeChat = (chat, otherUser = null) => {
    if (!chat) return null;

    const id = chat.id || chat.chatId;

    if (!id) return null;

    return {
      ...chat,
      id,
      otherUser: chat.otherUser || otherUser || getOtherUser(chat),
    };
  };

  const handleSelectChat = async (chat) => {
    const normalizedChat = normalizeChat(chat);

    if (!normalizedChat) {
      console.error("Cannot select chat without an ID:", chat);
      return;
    }

    dispatch(setActiveChat(normalizedChat));

    try {
      const history = await requestChatMessages(normalizedChat.id);

      dispatch(
        setChatHistory({
          chatId: normalizedChat.id,
          messages: history,
        }),
      );
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const handleSelectUser = async (user) => {
    if (!currentUser?.uid || !user?.uid) return;

    try {
      const chat = await createChat(currentUser.uid, user.uid);
      const normalizedChat = normalizeChat(chat, user);

      if (!normalizedChat) return;

      await handleSelectChat(normalizedChat);
    } catch (error) {
      console.error("Failed to create/open chat:", error);
    }
  };

  const chatsWithUsers = chats.map((chat) =>
    normalizeChat(chat),
  );

  const activeChatWithUser = activeChat
    ? normalizeChat(activeChat)
    : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#2B2129] text-[#E5D1B8]">
      <ChatSidebar
        currentUser={currentUser}
        users={users}
        chats={chatsWithUsers.filter(Boolean)}
        activeChat={activeChatWithUser}
        onSelectUser={handleSelectUser}
        onSelectChat={handleSelectChat}
        getOtherUser={getOtherUser}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-[#2B2129]">
        {activeChatWithUser ? (
          <>
            <ChatHeader chat={activeChatWithUser} />

            <MessageList
              messages={messages}
              currentUserId={currentUser?.uid}
            />

            <MessageInput
              chat={activeChatWithUser}
              currentUserId={currentUser?.uid}
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
                Choose someone from your conversations to start chatting.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
