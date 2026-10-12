
import { useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

export default function Sidebar({
  chats,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) {
  const [menuId, setMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");

  function startRename(chat) {
    setEditingId(chat.id);
    setTitle(chat.title || "");
    setMenuId(null);
  }

  function finishRename(id) {
    if (editingId !== id) return;

    setEditingId(null);

    const value = title.trim();
    if (value && value !== chats.find((c) => c.id === id)?.title) {
      onRename(id, value);
    }
  }

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[285px] flex-col",
          "border-r border-zinc-200 bg-zinc-50 p-3 text-zinc-900",
          "transition-all duration-200 dark:border-zinc-800",
          "dark:bg-zinc-950 dark:text-zinc-100",
          "md:relative md:z-10 md:translate-x-0",
          collapsed ? "md:w-[76px]" : "md:w-[278px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="mb-6 flex h-10 items-center justify-between">
          {!collapsed && (
            <button
              onClick={onNew}
              className="flex items-center gap-2 rounded-xl px-1 py-1 text-xl font-bold tracking-tight"
              title="New conversation"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                <Sparkles size={19} />
              </span>
              Lumina<span className="-ml-2 text-violet-500">.</span>
            </button>
          )}

          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden size-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white md:grid"
          >
            {collapsed ? (
              <PanelLeftOpen size={19} />
            ) : (
              <PanelLeftClose size={19} />
            )}
          </button>

          <button
            onClick={onMobileClose}
            aria-label="Close sidebar"
            className="grid size-9 place-items-center rounded-xl text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 md:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <button
          onClick={onNew}
          title="New conversation"
          className={[
            "flex h-11 shrink-0 items-center gap-3 rounded-xl",
            "border border-zinc-200 bg-white px-3 text-sm font-semibold",
            "transition hover:border-violet-300 hover:bg-violet-50",
            "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-700",
            "dark:hover:bg-violet-950/40",
            collapsed ? "md:justify-center md:px-0" : "",
          ].join(" ")}
        >
          <Plus size={18} className="text-violet-500" />
          <span className={collapsed ? "md:hidden" : ""}>New chat</span>
        </button>

        <div
          className={[
            "mt-7 min-h-0 flex-1 overflow-y-auto",
            collapsed ? "md:hidden" : "",
          ].join(" ")}
        >
          <div className="mb-3 px-2 text-[10px] font-bold tracking-[0.16em] text-zinc-400">
            YOUR CONVERSATIONS
          </div>

          {chats.length === 0 ? (
            <p className="px-2 py-3 text-xs leading-6 text-zinc-500">
              Your saved chats will appear here.
            </p>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => {
                const active = activeId === chat.id;

                return (
                  <div
                    key={chat.id}
                    className={[
                      "group relative flex min-w-0 items-center rounded-xl",
                      "transition",
                      active
                        ? "bg-violet-100 text-violet-950 dark:bg-violet-500/15 dark:text-violet-100"
                        : "text-zinc-600 hover:bg-zinc-200/80 dark:text-zinc-400 dark:hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    {editingId === chat.id ? (
                      <form
                        className="flex min-w-0 flex-1 gap-1 p-1"
                        onSubmit={(event) => {
                          event.preventDefault();
                          finishRename(chat.id);
                        }}
                      >
                        <input
                          autoFocus
                          maxLength={80}
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          onBlur={() => finishRename(chat.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") setEditingId(null);
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-violet-400 bg-white px-2 py-2 text-xs text-zinc-900 outline-none dark:bg-zinc-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          aria-label="Save title"
                          className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950"
                        >
                          <Check size={15} />
                        </button>
                      </form>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onSelect(chat.id);
                            onMobileClose();
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-3 text-left text-xs"
                        >
                          <MessageSquare
                            size={16}
                            className="shrink-0 opacity-70"
                          />
                          <span className="truncate">{chat.title || "New chat"}</span>
                        </button>

                        <button
                          onClick={() =>
                            setMenuId(menuId === chat.id ? null : chat.id)
                          }
                          aria-label="Conversation options"
                          className={[
                            "mr-1 grid size-7 shrink-0 place-items-center rounded-lg",
                            "text-zinc-500 transition hover:bg-black/5 dark:hover:bg-white/10",
                            menuId === chat.id
                              ? "opacity-100"
                              : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
                          ].join(" ")}
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {menuId === chat.id && (
                          <>
                            <button
                              aria-label="Close conversation menu"
                              className="fixed inset-0 z-20 cursor-default"
                              onClick={() => setMenuId(null)}
                            />

                            <div className="absolute right-1 top-10 z-30 w-40 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-black/10 dark:border-zinc-700 dark:bg-zinc-900">
                              <button
                                onClick={() => startRename(chat)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              >
                                <Pencil size={14} />
                                Rename
                              </button>

                              <button
                                onClick={() => {
                                  setMenuId(null);
                                  onDelete(chat.id);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {collapsed && (
          <div className="mt-5 hidden flex-col gap-2 md:flex">
            {chats.slice(0, 5).map((chat) => (
              <button
                key={chat.id}
                title={chat.title}
                onClick={() => onSelect(chat.id)}
                className={[
                  "grid size-10 place-items-center rounded-xl transition",
                  activeId === chat.id
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800",
                ].join(" ")}
              >
                <MessageSquare size={17} />
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <div
            className={[
              "flex items-center gap-3 rounded-xl p-2",
              collapsed ? "md:justify-center" : "",
            ].join(" ")}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-violet-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-violet-300">
              <Bot size={18} />
            </span>

            <div className={collapsed ? "md:hidden" : ""}>
              <p className="text-xs font-semibold">Lumina AI</p>
              <p className="mt-0.5 text-[10px] text-zinc-500">
                Powered by Gemini
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
