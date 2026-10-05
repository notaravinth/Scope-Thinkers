import { auth } from "../firebase/firebase";

let socket = null;
let isConnecting = false;
let isAuthenticated = false;

const messageListeners = new Set();
const connectionListeners = new Set();

let authenticationPromise = null;
let resolveAuthentication = null;
let rejectAuthentication = null;

let historyRequestId = 0;

const pendingHistoryRequests = new Map();

export const connectWebSocket = async () => {
  if (socket && socket.readyState === WebSocket.OPEN && isAuthenticated) {
    return socket;
  }

  if (isConnecting) {
    return authenticationPromise;
  }

  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  isConnecting = true;
  isAuthenticated = false;

  authenticationPromise = new Promise((resolve, reject) => {
    resolveAuthentication = resolve;

    rejectAuthentication = reject;
  });

  try {
    const token = await user.getIdToken();

    socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("WebSocket connected");

      socket.send(
        JSON.stringify({
          type: "authenticate",
          token,
        }),
      );
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("WebSocket event:", data);

        /*
         * Authentication
         */
        if (data.type === "authenticated") {
          isAuthenticated = true;
          isConnecting = false;

          console.log("WebSocket authenticated:", data.userId);

          if (resolveAuthentication) {
            resolveAuthentication(socket);
          }

          resolveAuthentication = null;

          rejectAuthentication = null;

          connectionListeners.forEach((listener) => {
            listener(true);
          });
        }

        /*
         * Message history
         *
         * Resolve the exact request
         * that asked for this chat.
         */
        if (data.type === "messages_history") {
          const request = pendingHistoryRequests.get(data.chatId);

          if (request) {
            pendingHistoryRequests.delete(data.chatId);

            request.resolve(data.messages);
          }
        }

        /*
         * Server error
         */
        if (data.type === "error") {
          console.error("WebSocket server error:", data.message);

          /*
           * Reject pending history
           * requests if applicable.
           */
          if (data.chatId) {
            const request = pendingHistoryRequests.get(data.chatId);

            if (request) {
              pendingHistoryRequests.delete(data.chatId);

              request.reject(new Error(data.message));
            }
          }

          if (!isAuthenticated && rejectAuthentication) {
            rejectAuthentication(new Error(data.message));

            resolveAuthentication = null;

            rejectAuthentication = null;

            isConnecting = false;
          }
        }

        /*
         * Notify normal WebSocket
         * subscribers.
         */
        messageListeners.forEach((listener) => {
          listener(data);
        });
      } catch (error) {
        console.error("Failed to parse WebSocket event:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");

      const wasAuthenticated = isAuthenticated;

      isAuthenticated = false;
      isConnecting = false;
      socket = null;

      /*
       * Reject any pending history
       * requests.
       */
      pendingHistoryRequests.forEach((request) => {
        request.reject(new Error("WebSocket connection closed."));
      });

      pendingHistoryRequests.clear();

      if (!wasAuthenticated && rejectAuthentication) {
        rejectAuthentication(
          new Error("WebSocket connection closed before authentication."),
        );
      }

      resolveAuthentication = null;

      rejectAuthentication = null;

      authenticationPromise = null;

      connectionListeners.forEach((listener) => {
        listener(false);
      });
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);

      isConnecting = false;
    };

    return authenticationPromise;
  } catch (error) {
    isConnecting = false;
    isAuthenticated = false;
    socket = null;

    if (rejectAuthentication) {
      rejectAuthentication(error);
    }

    resolveAuthentication = null;

    rejectAuthentication = null;

    authenticationPromise = null;

    throw error;
  }
};

const waitForAuthentication = async () => {
  if (socket && socket.readyState === WebSocket.OPEN && isAuthenticated) {
    return;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    await connectWebSocket();
    return;
  }

  if (authenticationPromise) {
    await authenticationPromise;
    return;
  }

  throw new Error("WebSocket authentication is not available.");
};

export const sendWebSocketMessage = async (data) => {
  await waitForAuthentication();

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error("WebSocket is not connected.");
  }

  if (!isAuthenticated) {
    throw new Error("WebSocket is not authenticated.");
  }

  socket.send(JSON.stringify(data));
};

export const requestChatMessages = async (chatId) => {
  await waitForAuthentication();

  if (!chatId) {
    throw new Error("Chat ID is required.");
  }

  /*
   * If a request for this chat is
   * already waiting, reject the old
   * one so it cannot interfere.
   */
  const existingRequest = pendingHistoryRequests.get(chatId);

  if (existingRequest) {
    existingRequest.reject(new Error("Previous history request replaced."));

    pendingHistoryRequests.delete(chatId);
  }

  const requestId = ++historyRequestId;

  console.log("Requesting history:", {
    requestId,
    chatId,
  });

  const historyPromise = new Promise((resolve, reject) => {
    pendingHistoryRequests.set(chatId, {
      requestId,
      resolve,
      reject,
    });
  });

  socket.send(
    JSON.stringify({
      type: "get_messages",
      chatId,
    }),
  );

  return historyPromise;
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
  if (!socket) {
    return;
  }

  socket.close();

  socket = null;
  isConnecting = false;
  isAuthenticated = false;

  authenticationPromise = null;

  resolveAuthentication = null;

  rejectAuthentication = null;

  pendingHistoryRequests.forEach((request) => {
    request.reject(new Error("WebSocket disconnected."));
  });

  pendingHistoryRequests.clear();
};
