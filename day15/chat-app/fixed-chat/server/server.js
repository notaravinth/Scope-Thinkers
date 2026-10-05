import express from "express";
import cors from "cors";
import multer from "multer";
import http from "http";
import { WebSocketServer } from "ws";

import { adminAuth, adminDb } from "./firebaseAdmin.js";
import { testMySQLConnection, default as pool } from "./mysql.js";

const PORT = 8080;

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: true,
  })
);

app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

await testMySQLConnection();

/* =========================================================
   HTTP HELPERS
========================================================= */

const getTokenFromRequest = (req) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.substring(7);
};

const authenticateHttpRequest = async (req, res) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.status(401).json({
      message: "Authentication token missing.",
    });

    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("HTTP authentication error:", error);

    res.status(401).json({
      message: "Invalid authentication token.",
    });

    return null;
  }
};

const verifyChatParticipant = async (chatId, userId) => {
  const chatRef = adminDb.collection("chatter_chats").doc(chatId);
  const chatSnapshot = await chatRef.get();

  if (!chatSnapshot.exists) {
    return {
      valid: false,
      message: "Chat does not exist.",
    };
  }

  const chat = chatSnapshot.data();

  if (!Array.isArray(chat.participants)) {
    return {
      valid: false,
      message: "Chat participants are invalid.",
    };
  }

  if (!chat.participants.includes(userId)) {
    return {
      valid: false,
      message: "You are not a participant in this chat.",
    };
  }

  return {
    valid: true,
    chat,
  };
};

/* =========================================================
   FILE UPLOAD
========================================================= */

app.post("/api/files/upload", upload.single("file"), async (req, res) => {
  try {
    const decodedToken = await authenticateHttpRequest(req, res);

    if (!decodedToken) {
      return;
    }

    if (!req.file) {
      return res.status(400).json({
        message: "No file was uploaded.",
      });
    }

    const { chatId } = req.body;

    if (!chatId) {
      return res.status(400).json({
        message: "Chat ID is required.",
      });
    }

    const participantCheck = await verifyChatParticipant(
      chatId,
      decodedToken.uid
    );

    if (!participantCheck.valid) {
      return res.status(403).json({
        message: participantCheck.message,
      });
    }

    const file = req.file;

    const [result] = await pool.execute(
      `
      INSERT INTO chatter_files
      (
        chat_id,
        uploader_id,
        file_name,
        mime_type,
        file_size,
        file_data
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        chatId,
        decodedToken.uid,
        file.originalname,
        file.mimetype,
        file.size,
        file.buffer,
      ]
    );

    console.log(
      `File uploaded: ${file.originalname} | ID: ${result.insertId}`
    );

    res.status(201).json({
      success: true,
      fileId: result.insertId,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      chatId,
      uploaderId: decodedToken.uid,
    });
  } catch (error) {
    console.error("FILE UPLOAD ERROR:", error);

    res.status(500).json({
      message: "Failed to upload file.",
      error: error.message,
    });
  }
});

/* =========================================================
   FILE DOWNLOAD / VIEW
========================================================= */

app.get("/api/files/:fileId", async (req, res) => {
  try {
    const decodedToken = await authenticateHttpRequest(req, res);

    if (!decodedToken) {
      return;
    }

    const fileId = Number(req.params.fileId);

    if (!Number.isInteger(fileId) || fileId <= 0) {
      return res.status(400).json({
        message: "Invalid file ID.",
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        chat_id,
        uploader_id,
        file_name,
        mime_type,
        file_size,
        file_data
      FROM chatter_files
      WHERE id = ?
      `,
      [fileId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "File not found.",
      });
    }

    const file = rows[0];

    const participantCheck = await verifyChatParticipant(
      file.chat_id,
      decodedToken.uid
    );

    if (!participantCheck.valid) {
      return res.status(403).json({
        message: "You do not have access to this file.",
      });
    }

    res.setHeader("Content-Type", file.mime_type);

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.file_name)}"`
    );

    res.setHeader("Content-Length", file.file_size);

    res.send(file.file_data);
  } catch (error) {
    console.error("FILE DOWNLOAD ERROR:", error);

    res.status(500).json({
      message: "Failed to retrieve file.",
    });
  }
});

/* =========================================================
   WEBSOCKET SERVER
========================================================= */

const wss = new WebSocketServer({
  server,
});

const connectedUsers = new Map();

const sendToSocket = (socket, data) => {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(data));
  }
};

const sendToUser = (userId, data) => {
  const socket = connectedUsers.get(userId);

  if (!socket) {
    return;
  }

  sendToSocket(socket, data);
};

const serializeTimestamp = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
};

const buildMessage = (document) => {
  const data = document.data();

  return {
    id: document.id,
    chatId: data.chatId,
    senderId: data.senderId,
    receiverId: data.receiverId,
    type: data.type || "text",
    content: data.content || "",
    status: data.status || "sent",
    attachment: data.attachment || null,
    createdAt: serializeTimestamp(data.createdAt),
  };
};

/* =========================================================
   WEBSOCKET CONNECTION
========================================================= */

wss.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("message", async (rawMessage) => {
    try {
      const rawText = rawMessage.toString();

      if (!rawText.trim()) {
        return;
      }

      let data;

      try {
        data = JSON.parse(rawText);
      } catch {
        sendToSocket(socket, {
          type: "error",
          message: "Invalid JSON message.",
        });

        return;
      }

      /* ---------------- AUTHENTICATE ---------------- */

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
            message:
              error?.message ||
              "Firebase authentication failed.",
          });

          socket.close();
        }

        return;
      }

      /* ---------------- REQUIRE AUTH ---------------- */

      if (!socket.userId) {
        sendToSocket(socket, {
          type: "error",
          message: "WebSocket connection is not authenticated.",
        });

        return;
      }

      /* ---------------- SEND MESSAGE ---------------- */

      if (data.type === "send_message") {
        await handleSendMessage(socket, data);
        return;
      }

      /* ---------------- GET MESSAGES ---------------- */

      if (data.type === "get_messages") {
        await handleGetMessages(socket, data);
        return;
      }

      sendToSocket(socket, {
        type: "error",
        message: "Unknown WebSocket event.",
      });
    } catch (error) {
      console.error("WEBSOCKET HANDLER ERROR:", error);

      sendToSocket(socket, {
        type: "error",
        message:
          error?.message ||
          "Something went wrong on the WebSocket server.",
      });
    }
  });

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

  socket.on("error", (error) => {
    console.error("WebSocket socket error:", error);
  });
});

/* =========================================================
   SEND MESSAGE
========================================================= */

const handleSendMessage = async (socket, data) => {
  const {
    chatId,
    receiverId,
    content,
    messageType,
    attachment,
  } = data;

  const senderId = socket.userId;

  if (!chatId || !receiverId) {
    sendToSocket(socket, {
      type: "error",
      message: "Chat and receiver are required.",
    });

    return;
  }

  const type = messageType || "text";

  const trimmedContent =
    typeof content === "string"
      ? content.trim()
      : "";

  if (type === "text" && !trimmedContent) {
    sendToSocket(socket, {
      type: "error",
      message: "Message content is required.",
    });

    return;
  }

  if (type !== "text" && !attachment?.fileId) {
    sendToSocket(socket, {
      type: "error",
      message: "Attachment information is required.",
    });

    return;
  }

  const chatRef = adminDb
    .collection("chatter_chats")
    .doc(chatId);

  const chatSnapshot = await chatRef.get();

  if (!chatSnapshot.exists) {
    sendToSocket(socket, {
      type: "error",
      message: "Chat does not exist.",
    });

    return;
  }

  const chat = chatSnapshot.data();

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

  /* ---------------- ATTACHMENT VALIDATION ---------------- */

  if (type !== "text") {
    const allowedTypes = ["image", "file"];

    if (!allowedTypes.includes(type)) {
      sendToSocket(socket, {
        type: "error",
        message: "Unsupported attachment type.",
      });

      return;
    }

    const fileId = Number(attachment.fileId);

    if (!Number.isInteger(fileId) || fileId <= 0) {
      sendToSocket(socket, {
        type: "error",
        message: "Invalid file ID.",
      });

      return;
    }

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        chat_id,
        uploader_id,
        file_name,
        mime_type,
        file_size
      FROM chatter_files
      WHERE id = ?
      `,
      [fileId]
    );

    if (rows.length === 0) {
      sendToSocket(socket, {
        type: "error",
        message: "Attachment file does not exist.",
      });

      return;
    }

    const file = rows[0];

    if (
      file.chat_id !== chatId ||
      file.uploader_id !== senderId
    ) {
      sendToSocket(socket, {
        type: "error",
        message: "You cannot use this attachment.",
      });

      return;
    }

    attachment.fileId = file.id;
    attachment.name = file.file_name;
    attachment.mimeType = file.mime_type;
    attachment.size = file.file_size;
  }

  /* ---------------- CREATE MESSAGE ---------------- */

  const createdAt = new Date();

  const messageData = {
    chatId,
    senderId,
    receiverId,
    type,
    content: trimmedContent,
    status: "sent",
    createdAt,
  };

  if (type !== "text") {
    messageData.attachment = {
      fileId: attachment.fileId,
      name: attachment.name,
      size: attachment.size,
      mimeType: attachment.mimeType,
    };
  }

  const messageRef = await adminDb
    .collection("chatter_messages")
    .add(messageData);

  /* ---------------- UPDATE CHAT ---------------- */

  let lastMessage = trimmedContent;

  if (type === "image") {
    lastMessage = trimmedContent
      ? `📷 ${trimmedContent}`
      : "📷 Photo";
  }

  if (type === "file") {
    lastMessage = trimmedContent
      ? `📎 ${trimmedContent}`
      : `📎 ${attachment.name}`;
  }

  await chatRef.update({
    lastMessage,
    lastMessageAt: createdAt,
  });

  /* ---------------- SEND MESSAGE ---------------- */

  const message = {
    id: messageRef.id,
    ...messageData,
    createdAt: createdAt.toISOString(),
  };

  sendToSocket(socket, {
    type: "message_sent",
    message,
  });

  sendToUser(receiverId, {
    type: "new_message",
    message,
  });

  console.log(
    `Message sent: ${senderId} -> ${receiverId} (${type})`
  );
};

/* =========================================================
   GET MESSAGES
========================================================= */

const handleGetMessages = async (socket, data) => {
  const { chatId } = data;

  const userId = socket.userId;

  if (!chatId) {
    sendToSocket(socket, {
      type: "error",
      message: "Chat ID is required.",
    });

    return;
  }

  const chatRef = adminDb
    .collection("chatter_chats")
    .doc(chatId);

  try {
    const chatSnapshot = await chatRef.get();

    if (!chatSnapshot.exists) {
      sendToSocket(socket, {
        type: "error",
        chatId,
        message: "Chat does not exist.",
      });

      return;
    }

    const chat = chatSnapshot.data();

    if (!Array.isArray(chat.participants)) {
      sendToSocket(socket, {
        type: "error",
        chatId,
        message: "Chat participants are invalid.",
      });

      return;
    }

    if (!chat.participants.includes(userId)) {
      sendToSocket(socket, {
        type: "error",
        chatId,
        message: "You are not a participant in this chat.",
      });

      return;
    }

    const messagesSnapshot = await adminDb
      .collection("chatter_messages")
      .where("chatId", "==", chatId)
      .get();

    const messages = messagesSnapshot.docs
      .map(buildMessage)
      .sort((a, b) => {
        const aTime = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const bTime = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return aTime - bTime;
      });

    sendToSocket(socket, {
      type: "messages_history",
      chatId,
      messages,
    });

    console.log(
      `Loaded ${messages.length} messages for ${chatId}.`
    );
  } catch (error) {
    console.error("FAILED TO READ MESSAGES:", error);

    sendToSocket(socket, {
      type: "error",
      chatId,
      message: `Failed to read messages: ${error.message}`,
    });
  }
};

/* =========================================================
   START SERVER
========================================================= */

server.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});