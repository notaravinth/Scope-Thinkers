
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      body.error || `Request failed (${response.status})`
    );
  }

  return response.json();
}

export const api = {
  getChats() {
    return request("/api/chats");
  },

  createChat(title = "New chat") {
    return request("/api/chats", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
  },

  getMessages(chatId) {
    return request(
      `/api/chats/${encodeURIComponent(chatId)}/messages`
    );
  },

  renameChat(chatId, title) {
    return request(`/api/chats/${encodeURIComponent(chatId)}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    });
  },

  deleteChat(chatId) {
    return request(`/api/chats/${encodeURIComponent(chatId)}`, {
      method: "DELETE",
    });
  },

  sendMessage(chatId, message, signal) {
    return fetch(
      `${API_URL}/api/chats/${encodeURIComponent(chatId)}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
        signal,
      }
    );
  },
};
