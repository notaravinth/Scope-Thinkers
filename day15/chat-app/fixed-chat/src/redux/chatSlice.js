import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  chats: [],
  activeChat: null,
  messagesByChatId: {},
  loading: false,
};

const sortMessages = (messages) => {
  messages.sort((a, b) => {
    const aTime = a?.createdAt
      ? new Date(a.createdAt).getTime()
      : 0;
    const bTime = b?.createdAt
      ? new Date(b.createdAt).getTime()
      : 0;

    return aTime - bTime;
  });
};

const mergeMessages = (existing = [], incoming = []) => {
  const map = new Map();

  [...existing, ...incoming].forEach((message) => {
    if (!message) return;

    const key = message.id || `${message.chatId}-${message.createdAt}-${message.senderId}-${message.content}`;
    map.set(key, message);
  });

  const merged = Array.from(map.values());
  sortMessages(merged);
  return merged;
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = Array.isArray(action.payload) ? action.payload : [];
    },

    setChats: (state, action) => {
      state.chats = Array.isArray(action.payload) ? action.payload : [];
    },

    setActiveChat: (state, action) => {
      const chat = action.payload;

      state.activeChat = chat
        ? {
            ...chat,
            id: chat.id || chat.chatId,
          }
        : null;
    },

    setChatHistory: (state, action) => {
      const { chatId, messages } = action.payload || {};

      if (!chatId) return;

      state.messagesByChatId[chatId] = mergeMessages(
        state.messagesByChatId[chatId] || [],
        Array.isArray(messages) ? messages : [],
      );
    },

    addMessage: (state, action) => {
      const message = action.payload;

      if (!message?.chatId) return;

      const chatId = message.chatId;
      const existing = state.messagesByChatId[chatId] || [];

      state.messagesByChatId[chatId] = mergeMessages(existing, [message]);
    },

    clearChatMessages: (state, action) => {
      const chatId = action.payload;

      if (chatId) {
        delete state.messagesByChatId[chatId];
      }
    },

    setChatLoading: (state, action) => {
      state.loading = action.payload;
    },

    clearChat: (state) => {
      state.users = [];
      state.chats = [];
      state.activeChat = null;
      state.messagesByChatId = {};
      state.loading = false;
    },
  },
});

export const {
  setUsers,
  setChats,
  setActiveChat,
  setChatHistory,
  addMessage,
  clearChatMessages,
  setChatLoading,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
