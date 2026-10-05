import { auth } from "../firebase/firebase";

let socket = null;
let connectPromise = null;
let authenticated = false;

const messageListeners = new Set();
const connectionListeners = new Set();
const pendingHistoryRequests = new Map();

const notifyConnection = (connected) => {
  connectionListeners.forEach((listener) => listener(connected));
};

const rejectPendingHistory = (error) => {
  pendingHistoryRequests.forEach(({ reject }) => reject(error));
  pendingHistoryRequests.clear();
};

export const connectWebSocket = async () => {
  if (socket?.readyState === WebSocket.OPEN && authenticated) {
    return socket;
  }

  if (connectPromise) {
    return connectPromise;
  }

  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  connectPromise = new Promise(async (resolve, reject) => {
    try {
      const token = await user.getIdToken();
      const ws = new WebSocket("ws://localhost:8080");

      socket = ws;
      authenticated = false;

      ws.onopen = () => {
        console.log("WebSocket connected");

        ws.send(
          JSON.stringify({
            type: "authenticate",
            token,
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          console.log("WebSocket event:", data);

          if (data.type === "authenticated") {
            authenticated = true;
            console.log("WebSocket authenticated:", data.userId);
            notifyConnection(true);
            resolve(ws);
          }

          if (data.type === "messages_history") {
            const pending = pendingHistoryRequests.get(data.chatId);

            if (pending) {
              pendingHistoryRequests.delete(data.chatId);
              pending.resolve(data.messages || []);
            }
          }

          if (data.type === "error") {
            console.error("WebSocket server error:", data.message);

            if (data.chatId) {
              const pending = pendingHistoryRequests.get(data.chatId);

              if (pending) {
                pendingHistoryRequests.delete(data.chatId);
                pending.reject(new Error(data.message));
              }
            }
          }

          messageListeners.forEach((listener) => listener(data));
        } catch (error) {
          console.error("Failed to parse WebSocket event:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");

        const wasAuthenticated = authenticated;

        authenticated = false;

        if (socket === ws) {
          socket = null;
        }

        rejectPendingHistory(
          new Error("WebSocket connection closed."),
        );

        notifyConnection(false);

        if (!wasAuthenticated) {
          reject(new Error("WebSocket connection closed before authentication."));
        }

        connectPromise = null;
      };
    } catch (error) {
      connectPromise = null;
      reject(error);
    }
  });

  try {
    return await connectPromise;
  } catch (error) {
    connectPromise = null;
    throw error;
  }
};

const waitForConnection = async () => {
  if (socket?.readyState === WebSocket.OPEN && authenticated) {
    return;
  }

  await connectWebSocket();
};

export const sendWebSocketMessage = async (data) => {
  await waitForConnection();

  if (!socket || socket.readyState !== WebSocket.OPEN || !authenticated) {
    throw new Error("WebSocket is not connected and authenticated.");
  }

  socket.send(JSON.stringify(data));
};

export const requestChatMessages = async (chatId) => {
  if (!chatId) {
    throw new Error("Chat ID is required.");
  }

  await waitForConnection();

  const existing = pendingHistoryRequests.get(chatId);

  if (existing) {
    existing.reject(new Error("Previous history request replaced."));
    pendingHistoryRequests.delete(chatId);
  }

  const promise = new Promise((resolve, reject) => {
    pendingHistoryRequests.set(chatId, { resolve, reject });
  });

  socket.send(
    JSON.stringify({
      type: "get_messages",
      chatId,
    }),
  );

  return promise;
};

export const subscribeToWebSocket = (listener) => {
  messageListeners.add(listener);

  return () => {
    messageListeners.delete(listener);
  };
};

export const subscribeToConnection = (listener) => {
  connectionListeners.add(listener);

  return () => {
    connectionListeners.delete(listener);
  };
};

export const disconnectWebSocket = () => {
  if (!socket) return;

  rejectPendingHistory(new Error("WebSocket disconnected."));

  socket.close();
  socket = null;
  authenticated = false;
  connectPromise = null;
};
