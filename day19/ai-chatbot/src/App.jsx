
import { useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { api } from "./lib/api";

export default function App() {
  const [chats, setChats] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("ai-chat-theme") || "light"
  );

  const activeIdRef = useRef(null);
  const sendingRef = useRef(false);
  const abortRef = useRef(null);

  useEffect(() => {
    const isDark = theme === "dark";

    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("ai-chat-theme", theme);
  }, [theme]);

  const selectChat = useCallback(async (id) => {
    if (sendingRef.current) return;

    activeIdRef.current = id;
    setActiveId(id);
    setMessages([]);
    setError("");

    try {
      const data = await api.getMessages(id);

      // Ignore stale responses if another conversation was selected.
      if (activeIdRef.current === id) {
        setMessages(data);
      }
    } catch (err) {
      if (activeIdRef.current === id) {
        setError(err.message || "Could not load messages.");
      }
    }
  }, []);

  const loadChats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getChats();
      setChats(data);

      const currentId = activeIdRef.current;
      const selected = data.find((chat) => chat.id === currentId);

      if (selected) {
        await selectChat(selected.id);
      } else if (data.length > 0) {
        await selectChat(data[0].id);
      } else {
        activeIdRef.current = null;
        setActiveId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err.message || "Could not load conversations.");
    } finally {
      setLoading(false);
    }
  }, [selectChat]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  async function createChat() {
    if (sendingRef.current) return;

    setError("");

    try {
      const chat = await api.createChat();

      setChats((previous) => [chat, ...previous]);
      activeIdRef.current = chat.id;
      setActiveId(chat.id);
      setMessages([]);
      setMobileOpen(false);
    } catch (err) {
      setError(err.message || "Could not create a conversation.");
    }
  }

  async function renameChat(id, title) {
    try {
      const result = await api.renameChat(id, title);

      setChats((previous) =>
        previous.map((chat) =>
          chat.id === id ? { ...chat, title: result.title } : chat
        )
      );
    } catch (err) {
      setError(err.message || "Could not rename conversation.");
    }
  }

  async function deleteChat(id) {
    if (sendingRef.current) return;

    if (!window.confirm("Delete this conversation permanently?")) return;

    try {
      await api.deleteChat(id);

      const remaining = chats.filter((chat) => chat.id !== id);
      setChats(remaining);

      if (activeIdRef.current === id) {
        activeIdRef.current = null;
        setActiveId(null);
        setMessages([]);

        if (remaining.length > 0) {
          await selectChat(remaining[0].id);
        }
      }
    } catch (err) {
      setError(err.message || "Could not delete conversation.");
    }
  }

  async function sendMessage(text) {
    const content = text.trim();

    if (!content || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setError("");

    let chatId = activeIdRef.current;
    const assistantId = crypto.randomUUID();
    const userMessageId = crypto.randomUUID();

    let fullResponse = "";

    try {
      if (!chatId) {
        const chat = await api.createChat();

        chatId = chat.id;
        activeIdRef.current = chatId;

        setActiveId(chatId);
        setChats((previous) => [chat, ...previous]);
      }

      const userMessage = {
        id: userMessageId,
        role: "user",
        content,
      };

      const assistantMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setMessages((previous) => [
        ...previous,
        userMessage,
        assistantMessage,
      ]);

      setStreamingId(assistantId);

      abortRef.current = new AbortController();

      const response = await api.sendMessage(
        chatId,
        content,
        abortRef.current.signal
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "The AI server returned an error.");
      }

      if (!response.body) {
        throw new Error("This browser does not support response streaming.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();

        buffer += decoder.decode(value || new Uint8Array(), {
          stream: !done,
        });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const line = event
            .split("\n")
            .find((item) => item.startsWith("data: "));

          if (!line) continue;

          const payload = JSON.parse(line.slice(6));

          if (payload.type === "token") {
            fullResponse += payload.text;

            if (activeIdRef.current === chatId) {
              setMessages((previous) =>
                previous.map((item) =>
                  item.id === assistantId
                    ? { ...item, content: fullResponse }
                    : item
                )
              );
            }
          }

          if (payload.type === "error") {
            throw new Error(payload.message);
          }

          if (payload.type === "done") {
            finished = true;
          }
        }

        if (done) break;
      }

      // The backend saves the completed assistant message.
      const latestChats = await api.getChats();
      setChats(latestChats);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong.");

        if (activeIdRef.current === chatId) {
          if (fullResponse) {
            setMessages((previous) =>
              previous.map((item) =>
                item.id === assistantId
                  ? { ...item, content: fullResponse }
                  : item
              )
            );
          } else {
            setMessages((previous) =>
              previous.filter((item) => item.id !== assistantId)
            );
          }
        }
      } else if (activeIdRef.current === chatId) {
        setMessages((previous) =>
          previous.filter(
            (item) =>
              item.id !== assistantId || Boolean(item.content)
          )
        );
      }
    } finally {
      abortRef.current = null;
      sendingRef.current = false;
      setSending(false);
      setStreamingId(null);
    }
  }

  function stopGeneration() {
    abortRef.current?.abort();
  }

  const activeChat =
    chats.find((chat) => chat.id === activeId) || null;

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-white dark:bg-zinc-950">
      <Sidebar
        chats={chats}
        activeId={activeId}
        onSelect={selectChat}
        onNew={createChat}
        onRename={renameChat}
        onDelete={deleteChat}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {loading && chats.length === 0 ? (
          <div className="grid flex-1 place-items-center text-sm text-zinc-500">
            Loading your conversations...
          </div>
        ) : (
          <ChatWindow
            chat={activeChat}
            messages={messages}
            onSend={sendMessage}
            sending={sending}
            streamingId={streamingId}
            onStop={stopGeneration}
            theme={theme}
            onToggleTheme={() =>
              setTheme((current) =>
                current === "light" ? "dark" : "light"
              )
            }
            onNew={createChat}
            onOpenSidebar={() => setMobileOpen(true)}
            error={error}
            onDismissError={() => setError("")}
          />
        )}
      </div>
    </main>
  );
}
