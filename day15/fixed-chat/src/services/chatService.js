import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

/*
|--------------------------------------------------------------------------
| Convert Firestore Timestamp to a serializable string
|--------------------------------------------------------------------------
*/

const serializeTimestamp = (timestamp) => {
  if (!timestamp) {
    return null;
  }

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toISOString();
  }

  return timestamp;
};

/*
|--------------------------------------------------------------------------
| Serialize Firestore document
|--------------------------------------------------------------------------
*/

const serializeDocument = (document) => {
  const data = document.data();

  return {
    id: document.id,
    ...data,

    createdAt: serializeTimestamp(data.createdAt),

    lastMessageAt: serializeTimestamp(data.lastMessageAt),
  };
};

/*
|--------------------------------------------------------------------------
| Get all Chatter users
|--------------------------------------------------------------------------
*/

export const getChatterUsers = async (currentUserId) => {
  const usersRef = collection(db, "chatter_users");

  const snapshot = await getDocs(usersRef);

  return snapshot.docs
    .map(serializeDocument)
    .filter((user) => user.uid !== currentUserId);
};

/*
|--------------------------------------------------------------------------
| Find an existing chat
|--------------------------------------------------------------------------
*/

export const findExistingChat = async (currentUserId, otherUserId) => {
  const chatsRef = collection(db, "chatter_chats");

  const q = query(
    chatsRef,
    where("participants", "array-contains", currentUserId),
  );

  const snapshot = await getDocs(q);

  const existingChat = snapshot.docs.find((document) => {
    const data = document.data();

    return data.participants.includes(otherUserId);
  });

  if (!existingChat) {
    return null;
  }

  return serializeDocument(existingChat);
};

/*
|--------------------------------------------------------------------------
| Create a chat
|--------------------------------------------------------------------------
*/

export const createChat = async (currentUserId, otherUserId) => {
  const existingChat = await findExistingChat(currentUserId, otherUserId);

  if (existingChat) {
    return existingChat;
  }

  const chatsRef = collection(db, "chatter_chats");

  const chatDocument = await addDoc(chatsRef, {
    participants: [currentUserId, otherUserId],

    lastMessage: "",

    lastMessageAt: null,

    createdAt: serverTimestamp(),
  });

  return {
    id: chatDocument.id,

    participants: [currentUserId, otherUserId],

    lastMessage: "",

    lastMessageAt: null,

    createdAt: new Date().toISOString(),
  };
};

/*
|--------------------------------------------------------------------------
| Subscribe to user's chats
|--------------------------------------------------------------------------
|
| This is used for the sidebar.
|
| We still use Firestore here because the
| sidebar needs to react when lastMessage
| or lastMessageAt changes.
|
*/

export const subscribeToUserChats = (userId, callback) => {
  const chatsRef = collection(db, "chatter_chats");

  const q = query(chatsRef, where("participants", "array-contains", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const chats = snapshot.docs.map(serializeDocument);

      chats.sort((a, b) => {
        const aTime = a.lastMessageAt
          ? new Date(a.lastMessageAt).getTime()
          : a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

        const bTime = b.lastMessageAt
          ? new Date(b.lastMessageAt).getTime()
          : b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

        return bTime - aTime;
      });

      callback(chats);
    },
    (error) => {
      console.error("Chat subscription error:", error);
    },
  );
};

/*
|--------------------------------------------------------------------------
| Get chat history
|--------------------------------------------------------------------------
|
| This is NOT real-time.
|
| It loads the existing messages once
| when the user opens a conversation.
|
*/

export const getChatMessages = async (chatId) => {
  const messagesRef = collection(db, "chatter_messages");

  const q = query(messagesRef, where("chatId", "==", chatId));

  const snapshot = await getDocs(q);

  const messages = snapshot.docs.map(serializeDocument);

  messages.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;

    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return aTime - bTime;
  });

  return messages;
};
