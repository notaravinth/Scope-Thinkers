import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
};

const chatSlice = createSlice({
  name: "chat",

  initialState,

  reducers: {
    /*
     * ==================================================
     * USERS
     * ==================================================
     */

    setUsers: (state, action) => {
      state.users = Array.isArray(
        action.payload
      )
        ? action.payload
        : [];
    },

    /*
     * ==================================================
     * CHATS
     * ==================================================
     */

    setChats: (state, action) => {
      state.chats = Array.isArray(
        action.payload
      )
        ? action.payload
        : [];
    },

    /*
     * ==================================================
     * ACTIVE CHAT
     * ==================================================
     */

    setActiveChat: (
      state,
      action
    ) => {
      const chat =
        action.payload;

      if (!chat) {
        state.activeChat =
          null;

        state.messages = [];

        return;
      }

      state.activeChat = {
        ...chat,

        id:
          chat.id ||
          chat.chatId,
      };

      /*
       * Clear the previous conversation's messages.
       *
       * The new chat's history will be loaded by
       * Chat.jsx.
       */

      state.messages = [];
    },

    /*
     * ==================================================
     * SET / MERGE MESSAGE HISTORY
     * ==================================================
     *
     * IMPORTANT:
     *
     * We do not simply do:
     *
     * state.messages = incomingMessages
     *
     * because a WebSocket message may arrive while
     * history is being fetched.
     *
     * Instead, we merge both collections using
     * the message ID.
     */

    setMessages: (
      state,
      action
    ) => {
      const incomingMessages =
        Array.isArray(
          action.payload
        )
          ? action.payload
          : [];

      const messageMap =
        new Map();

      /*
       * Keep messages that have already arrived
       * through WebSocket.
       */

      state.messages.forEach(
        (message) => {
          if (
            message?.id
          ) {
            messageMap.set(
              message.id,
              message
            );
          }
        }
      );

      /*
       * Add messages from history.
       *
       * If the message already exists, the history
       * version replaces it.
       */

      incomingMessages.forEach(
        (message) => {
          if (
            message?.id
          ) {
            messageMap.set(
              message.id,
              message
            );
          }
        }
      );

      /*
       * Convert back to array.
       */

      state.messages =
        Array.from(
          messageMap.values()
        );

      /*
       * Sort oldest → newest.
       */

      state.messages.sort(
        (a, b) => {
          const aTime =
            a.createdAt
              ? new Date(
                  a.createdAt
                ).getTime()
              : 0;

          const bTime =
            b.createdAt
              ? new Date(
                  b.createdAt
                ).getTime()
              : 0;

          return (
            aTime - bTime
          );
        }
      );

      console.log(
        "MESSAGES SET/MERGED:",
        state.messages
      );
    },

    /*
     * ==================================================
     * ADD REALTIME MESSAGE
     * ==================================================
     */

    addMessage: (
      state,
      action
    ) => {
      const message =
        action.payload;

      if (!message) {
        return;
      }

      console.log(
        "ADDING MESSAGE TO REDUX:",
        message
      );

      /*
       * Prevent duplicates.
       */

      const alreadyExists =
        state.messages.some(
          (existingMessage) =>
            existingMessage.id &&
            message.id &&
            existingMessage.id ===
              message.id
        );

      if (alreadyExists) {
        console.log(
          "MESSAGE ALREADY EXISTS:",
          message.id
        );

        return;
      }

      /*
       * Add immediately.
       */

      state.messages.push(
        message
      );

      /*
       * Keep chronological order.
       */

      state.messages.sort(
        (a, b) => {
          const aTime =
            a.createdAt
              ? new Date(
                  a.createdAt
                ).getTime()
              : 0;

          const bTime =
            b.createdAt
              ? new Date(
                  b.createdAt
                ).getTime()
              : 0;

          return (
            aTime - bTime
          );
        }
      );

      console.log(
        "MESSAGES IN REDUX AFTER ADD:",
        state.messages
      );
    },

    /*
     * ==================================================
     * LOADING
     * ==================================================
     */

    setChatLoading: (
      state,
      action
    ) => {
      state.loading =
        action.payload;
    },

    /*
     * ==================================================
     * CLEAR CHAT
     * ==================================================
     */

    clearChat: (state) => {
      state.users = [];
      state.chats = [];
      state.activeChat = null;
      state.messages = [];
      state.loading = false;
    },
  },
});

export const {
  setUsers,
  setChats,
  setActiveChat,
  setMessages,
  addMessage,
  setChatLoading,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;