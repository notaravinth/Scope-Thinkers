
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Code2,
  Lightbulb,
  Menu,
  Moon,
  Plus,
  Send,
  Sparkles,
  Sun,
  Terminal,
  X,
} from "lucide-react";
import MessageBubble from "./MessageBubble";

const suggestions = [
  {
    title: "Explain a concept",
    prompt: "Explain React hooks with simple examples.",
    icon: BookOpen,
  },
  {
    title: "Brainstorm ideas",
    prompt: "Suggest five unique full-stack JavaScript project ideas.",
    icon: Lightbulb,
  },
  {
    title: "Debug my code",
    prompt: "Give me a systematic approach to debugging React apps.",
    icon: Terminal,
  },
  {
    title: "Write some code",
    prompt: "Show me a reusable React component and explain how it works.",
    icon: Code2,
  },
];

export default function ChatWindow({
  chat,
  messages,
  onSend,
  sending,
  streamingId,
  onStop,
  theme,
  onToggleTheme,
  onNew,
  onOpenSidebar,
  error,
  onDismissError,
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setInput("");
  }, [chat?.id]);

  function submit(event) {
    event.preventDefault();

    if (!input.trim() || sending) return;

    onSend(input.trim());
    setInput("");
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="z-10 flex h-[68px] shrink-0 items-center justify-between border-b border-zinc-200 bg-white/90 px-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="max-w-[45vw] truncate text-sm font-bold">
              {chat?.title || "New conversation"}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Gemini AI
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="grid size-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 hover:text-violet-600 dark:hover:bg-zinc-800 dark:hover:text-violet-300"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          <button
            onClick={onNew}
            disabled={sending}
            className="flex h-9 items-center gap-2 rounded-xl bg-violet-600 px-3 text-xs font-semibold text-white shadow-sm shadow-violet-500/20 transition hover:bg-violet-700 disabled:opacity-50"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New chat</span>
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-5 py-12 text-center sm:px-8">
            <div className="mb-6 grid size-16 place-items-center rounded-[22px] border border-violet-200 bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 shadow-lg shadow-violet-500/10 dark:border-violet-400/20 dark:from-violet-500/15 dark:to-indigo-500/10 dark:text-violet-300">
              <Sparkles size={29} />
            </div>

            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-violet-600 dark:text-violet-300">
              YOUR AI WORKSPACE
            </p>

            <h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
              What can we
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent dark:from-violet-300 dark:to-indigo-300">
                figure out today?
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-500 dark:text-zinc-400">
              Ask a question, explore an idea, or work through something
              complicated. Let's get into it.
            </p>

            <div className="mt-9 grid w-full max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {suggestions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={() => onSend(item.prompt)}
                    disabled={sending}
                    className="group rounded-2xl border border-zinc-200 bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/5 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-violet-500/50"
                  >
                    <span className="mb-3 grid size-9 place-items-center rounded-xl bg-violet-100 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-500/15 dark:text-violet-300">
                      <Icon size={18} />
                    </span>
                    <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-100">
                      {item.title}
                    </span>
                    <span className="mt-1.5 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                      {item.prompt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-7 sm:px-8 sm:py-10">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                streaming={message.id === streamingId}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <footer className="shrink-0 bg-white px-3 pb-3 pt-2 dark:bg-zinc-950 sm:px-6 sm:pb-5">
        <div className="mx-auto w-full max-w-3xl">
          {error && (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <span>{error}</span>
              <button
                onClick={onDismissError}
                aria-label="Dismiss error"
                className="grid size-7 shrink-0 place-items-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <form
            onSubmit={submit}
            className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 shadow-sm transition focus-within:border-violet-400 focus-within:ring-4 focus-within:ring-violet-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:border-violet-500"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit(event);
                }
              }}
              placeholder="Message Lumina..."
              rows={1}
              maxLength={20000}
              disabled={sending}
              className="max-h-40 min-h-11 min-w-0 flex-1 resize-y bg-transparent px-3 py-3 text-sm leading-6 outline-none placeholder:text-zinc-400 disabled:opacity-60 dark:placeholder:text-zinc-500"
            />

            {sending ? (
              <button
                type="button"
                onClick={onStop}
                title="Stop generation"
                aria-label="Stop generation"
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-500 text-white transition hover:bg-red-600"
              >
                <X size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                title="Send message"
                aria-label="Send message"
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-500"
              >
                <Send size={17} />
              </button>
            )}
          </form>

          <p className="mt-2.5 text-center text-[10px] leading-5 text-zinc-400">
            AI can make mistakes. Check important information.
            <span className="hidden sm:inline"> · Shift + Enter for a new line</span>
          </p>
        </div>
      </footer>
    </section>
  );
}
