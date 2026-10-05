import { WebSocketServer } from "ws";

import { adminAuth, adminDb } from "./firebaseAdmin.js";

const PORT = 8080;

/* =====================================
   WEBSOCKET SERVER
===================================== */

const wss = new WebSocketServer({
  port: PORT,
});

/* =====================================
   CONNECTED USERS
===================================== */

const connectedUsers = new Map();

/* =====================================
   SEND TO SOCKET
===================================== */

const sendToSocket = (socket, data) => {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(data));
  }
};

/* =====================================
   SEND TO USER
===================================== */

const sendToUser = (userId, data) => {
  const socket = connectedUsers.get(userId);

  if (!socket) {
    return;
  }

  sendToSocket(socket, data);
};

/* =====================================
   NEW CONNECTION
===================================== */

wss.on("connection", (socket) => {
  console.log("New WebSocket connection");

  /* =====================================
       RECEIVE MESSAGE
    ===================================== */

  socket.on("message", async (rawMessage) => {
    try {
      const rawText = rawMessage.toString();

      console.log("WebSocket raw message:", rawText);

      if (!rawText.trim()) {
        return;
      }

      let data;

      /* =====================================
             PARSE JSON
          ===================================== */

      try {
        data = JSON.parse(rawText);
      } catch (error) {
        console.error("JSON parse error:", error);

        sendToSocket(socket, {
          type: "error",
          message: "Invalid JSON message.",
        });

        return;
      }

      console.log("WebSocket parsed event:", data);

      /* =====================================
             AUTHENTICATE
          ===================================== */

      if (data.type === "authenticate") {
        const token = data.token;

        if (!token) {
          sendToSocket(socket, {
            type: "error",
            message: "Authentication token missing.",
          });

          socket.close();

          return;
        }

        try {
          const decodedToken = await adminAuth.verifyIdToken(token);

          const userId = decodedToken.uid;

          socket.userId = userId;

          connectedUsers.set(userId, socket);

          console.log(`User connected: ${userId}`);

          sendToSocket(socket, {
            type: "authenticated",
            userId,
          });
        } catch (error) {
          console.error("Firebase authentication error:", error);

          sendToSocket(socket, {
            type: "error",
            message: error?.message || "Firebase authentication failed.",
          });

          socket.close();
        }

        return;
      }

      /* =====================================
             AUTHENTICATION CHECK
          ===================================== */

      if (!socket.userId) {
        sendToSocket(socket, {
          type: "error",
          message: "WebSocket connection is not authenticated.",
        });

        return;
      }

      /* =====================================
             SEND MESSAGE
          ===================================== */

      if (data.type === "send_message") {
        await handleSendMessage(socket, data);

        return;
      }

      /* =====================================
             GET MESSAGE HISTORY
          ===================================== */

      if (data.type === "get_messages") {
        await handleGetMessages(socket, data);

        return;
      }

      /* =====================================
             UNKNOWN EVENT
          ===================================== */

      sendToSocket(socket, {
        type: "error",
        message: "Unknown WebSocket event.",
      });
    } catch (error) {
      console.error("=====================================");

      console.error("WEBSOCKET HANDLER ERROR");

      console.error("=====================================");

      console.error("Message:", error?.message);

      console.error("Stack:", error?.stack);

      console.error("Full error:", error);

      sendToSocket(socket, {
        type: "error",
        message:
          error?.message || "Something went wrong on the WebSocket server.",
      });
    }
  });

  /* =====================================
       SOCKET CLOSED
    ===================================== */

  socket.on("close", () => {
    if (!socket.userId) {
      return;
    }

    const currentSocket = connectedUsers.get(socket.userId);

    if (currentSocket === socket) {
      connectedUsers.delete(socket.userId);
    }

    console.log(`User disconnected: ${socket.userId}`);
  });

  /* =====================================
       SOCKET ERROR
    ===================================== */

  socket.on("error", (error) => {
    console.error("WebSocket socket error:", error);
  });
});

/* =====================================
   SEND MESSAGE
===================================== */

const handleSendMessage = async (socket, data) => {
  const { chatId, receiverId, content } = data;

  const senderId = socket.userId;

  /* =====================================
     VALIDATE MESSAGE
  ===================================== */

  if (!chatId || !receiverId || !content || !content.trim()) {
    sendToSocket(socket, {
      type: "error",
      message: "Invalid message data.",
    });

    return;
  }

  const trimmedContent = content.trim();

  /* =====================================
     GET CHAT
  ===================================== */

  const chatRef = adminDb.collection("chatter_chats").doc(chatId);

  const chatSnapshot = await chatRef.get();

  if (!chatSnapshot.exists) {
    sendToSocket(socket, {
      type: "error",
      message: "Chat does not exist.",
    });

    return;
  }

  const chat = chatSnapshot.data();

  /* =====================================
     SECURITY CHECK
  ===================================== */

  if (!Array.isArray(chat.participants)) {
    sendToSocket(socket, {
      type: "error",
      message: "Chat participants are invalid.",
    });

    return;
  }

  if (
    !chat.participants.includes(senderId) ||
    !chat.participants.includes(receiverId)
  ) {
    sendToSocket(socket, {
      type: "error",
      message: "You are not a participant in this chat.",
    });

    return;
  }

  /* =====================================
     CREATE MESSAGE
  ===================================== */

  const createdAt = new Date();

  const messageRef = await adminDb.collection("chatter_messages").add({
    chatId,
    senderId,
    receiverId,
    type: "text",
    content: trimmedContent,
    status: "sent",
    createdAt,
  });

  /* =====================================
     UPDATE CHAT
  ===================================== */

  await chatRef.update({
    lastMessage: trimmedContent,
    lastMessageAt: createdAt,
  });

  /* =====================================
     MESSAGE OBJECT
  ===================================== */

  const message = {
    id: messageRef.id,
    chatId,
    senderId,
    receiverId,
    type: "text",
    content: trimmedContent,
    status: "sent",
    createdAt: createdAt.toISOString(),
  };

  /* =====================================
     CONFIRM TO SENDER
  ===================================== */

  sendToSocket(socket, {
    type: "message_sent",
    message,
  });

  /* =====================================
     SEND TO RECEIVER
  ===================================== */

  sendToUser(receiverId, {
    type: "new_message",
    message,
  });

  console.log(`Message sent: ${senderId} -> ${receiverId}`);
};

/* =====================================
   GET MESSAGE HISTORY
===================================== */

const handleGetMessages = async (socket, data) => {
  const { chatId } = data;

  const userId = socket.userId;

  console.log("========== GET MESSAGES ==========");

  console.log("Chat ID:", chatId);

  console.log("User ID:", userId);

  /* =====================================
     VALIDATE CHAT ID
  ===================================== */

  if (!chatId) {
    sendToSocket(socket, {
      type: "error",
      message: "Chat ID is required.",
    });

    return;
  }

  /* =====================================
     GET CHAT
  ===================================== */

  const chatRef = adminDb.collection("chatter_chats").doc(chatId);

  let chatSnapshot;

  try {
    console.log("Attempting to read chatter_chats...");

    chatSnapshot = await chatRef.get();

    console.log("Chat read successful.");
  } catch (error) {
    console.error("FAILED TO READ CHAT:");

    console.error("Error code:", error.code);

    console.error("Error message:", error.message);

    console.error("Error stack:", error.stack);

    sendToSocket(socket, {
      type: "error",
      message: `Failed to read chat: ${error.message}`,
    });

    return;
  }

  /* =====================================
     CHECK CHAT EXISTS
  ===================================== */

  if (!chatSnapshot.exists) {
    sendToSocket(socket, {
      type: "error",
      message: "Chat does not exist.",
    });

    return;
  }

  const chat = chatSnapshot.data();

  console.log("Chat participants:", chat.participants);

  /* =====================================
     VALIDATE PARTICIPANTS
  ===================================== */

  if (!Array.isArray(chat.participants)) {
    sendToSocket(socket, {
      type: "error",
      message: "Chat participants are invalid.",
    });

    return;
  }

  /* =====================================
     SECURITY CHECK
  ===================================== */

  if (!chat.participants.includes(userId)) {
    sendToSocket(socket, {
      type: "error",
      message: "You are not a participant in this chat.",
    });

    return;
  }

  console.log("Participant check passed.");

  /* =====================================
     GET MESSAGES
  ===================================== */

  let messagesSnapshot;

  try {
    console.log("Attempting to read chatter_messages...");

    messagesSnapshot = await adminDb
      .collection("chatter_messages")
      .where("chatId", "==", chatId)
      .get();

    console.log("Messages read successful.");

    console.log("Message count:", messagesSnapshot.size);
  } catch (error) {
    console.error("FAILED TO READ MESSAGES:");

    console.error("Error code:", error.code);

    console.error("Error message:", error.message);

    console.error("Error stack:", error.stack);

    sendToSocket(socket, {
      type: "error",
      message: `Failed to read messages: ${error.message}`,
    });

    return;
  }

  /* =====================================
     SERIALIZE MESSAGES
  ===================================== */

  const messages = messagesSnapshot.docs
    .map((document) => {
      const message = document.data();

      let createdAt = null;

      if (message.createdAt) {
        if (typeof message.createdAt.toDate === "function") {
          createdAt = message.createdAt.toDate().toISOString();
        } else if (message.createdAt instanceof Date) {
          createdAt = message.createdAt.toISOString();
        } else if (typeof message.createdAt === "string") {
          createdAt = message.createdAt;
        }
      }

      return {
        id: document.id,
        chatId: message.chatId,
        senderId: message.senderId,
        receiverId: message.receiverId,
        type: message.type,
        content: message.content,
        status: message.status,
        createdAt,
      };
    })
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;

      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return aTime - bTime;
    });

  /* =====================================
     SEND HISTORY
  ===================================== */

  sendToSocket(socket, {
    type: "messages_history",
    chatId,
    messages,
  });

  console.log(`Loaded ${messages.length} messages.`);

  console.log("=================================");
};

/* =====================================
   SERVER STARTED
===================================== */

console.log(`WebSocket server running on ws://localhost:${PORT}`);
