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
    setUsers: (
      state,
      action
    ) => {
      state.users =
        action.payload;
    },

    setChats: (
      state,
      action
    ) => {
      state.chats =
        action.payload;
    },

    setActiveChat: (
      state,
      action
    ) => {
      state.activeChat =
        action.payload;

      state.messages = [];
    },

    setMessages: (
      state,
      action
    ) => {
      const incoming =
        Array.isArray(
          action.payload
        )
          ? action.payload
          : [];

      /*
       * Merge incoming history
       * with messages already in
       * Redux.
       */
      const messageMap =
        new Map();

      state.messages.forEach(
        (message) => {
          messageMap.set(
            message.id,
            message
          );
        }
      );

      incoming.forEach(
        (message) => {
          messageMap.set(
            message.id,
            message
          );
        }
      );

      state.messages =
        Array.from(
          messageMap.values()
        ).sort(
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
    },

    addMessage: (
      state,
      action
    ) => {
      const message =
        action.payload;

      /*
       * Prevent the same
       * WebSocket message from
       * appearing twice.
       */
      const exists =
        state.messages.some(
          (item) =>
            item.id ===
            message.id
        );

      if (!exists) {
        state.messages.push(
          message
        );
      }

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
    },

    setChatLoading: (
      state,
      action
    ) => {
      state.loading =
        action.payload;
    },

    clearChat: (
      state
    ) => {
      state.users = [];
      state.chats = [];
      state.activeChat =
        null;
      state.messages = [];
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