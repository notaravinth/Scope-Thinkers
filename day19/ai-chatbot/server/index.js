
import "dotenv/config";
import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebaseAdmin.js";

const app = express();
const PORT = process.env.PORT || 5000;
const chats = db.collection("ai_chats");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in server/.env");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// List conversations.
app.get("/api/chats", async (_req, res) => {
  try {
    const snapshot = await chats.orderBy("updatedAt", "desc").get();

    res.json(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  } catch (error) {
    console.error("List chats:", error.message);
    res.status(500).json({ error: "Could not load conversations." });
  }
});

// Create a conversation.
app.post("/api/chats", async (req, res) => {
  try {
    const id = randomUUID();
    const title =
      typeof req.body?.title === "string"
        ? req.body.title.trim().slice(0, 80)
        : "New chat";

    const chat = {
      title: title || "New chat",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await chats.doc(id).set(chat);

    res.status(201).json({
      id,
      title: chat.title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Create chat:", error.message);
    res.status(500).json({ error: "Could not create conversation." });
  }
});

// Get messages for a conversation.
app.get("/api/chats/:id/messages", async (req, res) => {
  try {
    const chatRef = chats.doc(req.params.id);
    const chat = await chatRef.get();

    if (!chat.exists) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    const snapshot = await chatRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    res.json(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    );
  } catch (error) {
    console.error("Load messages:", error.message);
    res.status(500).json({ error: "Could not load messages." });
  }
});

// Rename a conversation.
app.patch("/api/chats/:id", async (req, res) => {
  try {
    const title = req.body?.title;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 80
    ) {
      return res.status(400).json({ error: "Enter a valid title." });
    }

    const ref = chats.doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    await ref.update({
      title: title.trim(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ id: ref.id, title: title.trim() });
  } catch (error) {
    console.error("Rename chat:", error.message);
    res.status(500).json({ error: "Could not rename conversation." });
  }
});

// Delete a conversation and its messages.
app.delete("/api/chats/:id", async (req, res) => {
  try {
    const ref = chats.doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Firestore does not automatically delete subcollections.
    const messages = await ref.collection("messages").get();
    const batch = db.batch();

    messages.docs.forEach((message) => batch.delete(message.ref));
    batch.delete(ref);

    await batch.commit();

    res.json({ success: true });
  } catch (error) {
    console.error("Delete chat:", error.message);
    res.status(500).json({ error: "Could not delete conversation." });
  }
});

// Send a message and stream the AI response.
app.post("/api/chats/:id/messages", async (req, res) => {
  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

  if (!message || message.length > 20000) {
    return res.status(400).json({ error: "Enter a valid message." });
  }

  const chatRef = chats.doc(req.params.id);

  try {
    const chatDoc = await chatRef.get();

    if (!chatDoc.exists) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    const messagesRef = chatRef.collection("messages");
    const previous = await messagesRef.orderBy("createdAt", "asc").get();

    const history = previous.docs.map((doc) => doc.data());

    // Gemini expects alternating user/model messages.
    const contents = [];
    for (const item of history) {
      if (!["user", "assistant"].includes(item.role)) continue;
      if (typeof item.content !== "string") continue;

      const role = item.role === "assistant" ? "model" : "user";
      const last = contents[contents.length - 1];

      if (last?.role === role) {
        last.parts[0].text += "\n\n" + item.content;
      } else {
        contents.push({
          role,
          parts: [{ text: item.content }],
        });
      }
    }

    // Gemini requires the history to end with a user message.
    if (contents.length && contents[contents.length - 1].role === "user") {
      contents[contents.length - 1].parts[0].text += "\n\n" + message;
    } else {
      contents.push({
        role: "user",
        parts: [{ text: message }],
      });
    }

    await messagesRef.add({
      role: "user",
      content: message,
      createdAt: FieldValue.serverTimestamp(),
    });

    const isFirstMessage = history.length === 0;
    const title = message.length > 42
      ? message.slice(0, 42) + "…"
      : message;

    await chatRef.update({
      ...(isFirstMessage ? { title } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    let disconnected = false;
    res.on("close", () => {
      disconnected = true;
    });

    const sendEvent = (payload) => {
      if (!disconnected && !res.writableEnded) {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    };

    try {
      const stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction:
            "You are a helpful AI assistant. Be accurate, clear, " +
            "friendly, and use Markdown where it improves readability.",
          maxOutputTokens: 4096,
        },
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        if (disconnected) return;

        if (chunk.text) {
          fullResponse += chunk.text;
          sendEvent({ type: "token", text: chunk.text });
        }
      }

      if (fullResponse.trim()) {
        await messagesRef.add({
          role: "assistant",
          content: fullResponse,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      await chatRef.update({
        updatedAt: FieldValue.serverTimestamp(),
      });

      sendEvent({ type: "done" });
      res.end();
    } catch (error) {
      console.error("Gemini stream:", error.message);
      sendEvent({
        type: "error",
        message: "Gemini could not generate a response. Please try again.",
      });
      res.end();
    }
  } catch (error) {
    console.error("Send message:", error.message);

    if (!res.headersSent) {
      res.status(500).json({ error: "Could not process the message." });
    } else {
      res.end();
    }
  }
});

app.listen(PORT, () => {
  console.log(`AI chatbot server running at http://localhost:${PORT}`);
});
