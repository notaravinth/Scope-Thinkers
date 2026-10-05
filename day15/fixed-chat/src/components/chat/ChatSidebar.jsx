import { useMemo, useState } from "react";
import { Search, MessageCircle, Users } from "lucide-react";

const ChatSidebar = ({
  currentUser,
  users = [],
  chats = [],
  activeChat,
  onSelectUser,
  onSelectChat,
  getOtherUser,
}) => {
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const uniqueChats = useMemo(() => {
    const sorted = [...chats].sort((a, b) => {
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

    const seen = new Set();

    return sorted.reduce((result, chat) => {
      const otherUser = chat.otherUser || getOtherUser(chat);

      if (!otherUser || seen.has(otherUser.uid)) {
        return result;
      }

      if (
        normalizedSearch &&
        !otherUser.name?.toLowerCase().includes(normalizedSearch) &&
        !otherUser.email?.toLowerCase().includes(normalizedSearch)
      ) {
        return result;
      }

      seen.add(otherUser.uid);
      result.push({ ...chat, otherUser });
      return result;
    }, []);
  }, [chats, getOtherUser, normalizedSearch]);

  const conversationUserIds = new Set(
    chats
      .map((chat) => chat.otherUser || getOtherUser(chat))
      .filter(Boolean)
      .map((user) => user.uid),
  );

  const availableUsers = users.filter((user) => {
    if (conversationUserIds.has(user.uid)) return false;
    if (!normalizedSearch) return true;

    return (
      user.name?.toLowerCase().includes(normalizedSearch) ||
      user.email?.toLowerCase().includes(normalizedSearch)
    );
  });

  const formatLastMessage = (chat) =>
    chat.lastMessage || "No messages yet";

  return (
    <aside className="flex h-full w-[420px] shrink-0 flex-col border-r border-[#C2956E]/30 bg-[#2B2129]">
      <div className="border-b border-[#C2956E]/30 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#E5D1B8]">
              Chatter
            </h1>
            <p className="mt-1 text-xs text-[#C2956E]">
              Real-time conversations
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DD8E58] text-sm font-bold text-[#2B2129]">
            {currentUser?.name?.slice(0, 2).toUpperCase() || "ME"}
          </div>
        </div>

        <div className="relative mt-6">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C2956E]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search people..."
            className="h-16 w-full rounded-2xl border border-[#C2956E]/50 bg-transparent pl-12 pr-4 text-sm text-[#E5D1B8] outline-none transition placeholder:text-[#C2956E] focus:border-[#DD8E58]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle size={14} className="text-[#DD8E58]" />
            <p className="text-xs font-semibold tracking-[0.18em] text-[#C2956E]">
              CONVERSATIONS
            </p>
          </div>

          {uniqueChats.length === 0 ? (
            <div className="rounded-2xl border border-[#C2956E]/20 bg-[#E5D1B8]/5 px-4 py-5 text-center">
              <p className="text-sm text-[#C2956E]">
                No conversations found.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {uniqueChats.map((chat) => {
                const otherUser = chat.otherUser;
                const isActive = activeChat?.id === chat.id;

                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => onSelectChat(chat)}
                    className={`flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition ${
                      isActive
                        ? "bg-[#DD8E58] text-[#2B2129]"
                        : "text-[#E5D1B8] hover:bg-[#E5D1B8]/5"
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-bold ${
                        isActive
                          ? "bg-[#2B2129] text-[#DD8E58]"
                          : "bg-[#708A81] text-[#E5D1B8]"
                      }`}
                    >
                      {otherUser?.name?.slice(0, 1).toUpperCase() || "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-semibold ${
                          isActive
                            ? "text-[#2B2129]"
                            : "text-[#E5D1B8]"
                        }`}
                      >
                        {otherUser?.name || "Unknown user"}
                      </p>

                      <p
                        className={`mt-1 truncate text-xs ${
                          isActive
                            ? "text-[#2B2129]/70"
                            : "text-[#C2956E]"
                        }`}
                      >
                        {formatLastMessage(chat)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {availableUsers.length > 0 && (
          <div className="border-t border-[#C2956E]/20 px-4 py-5">
            <div className="mb-4 flex items-center gap-2">
              <Users size={14} className="text-[#DD8E58]" />
              <p className="text-xs font-semibold tracking-[0.18em] text-[#C2956E]">
                PEOPLE
              </p>
            </div>

            <div className="space-y-2">
              {availableUsers.map((person) => (
                <button
                  key={person.uid}
                  type="button"
                  onClick={() => onSelectUser(person)}
                  className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition hover:bg-[#E5D1B8]/5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#708A81] text-sm font-bold text-[#E5D1B8]">
                    {person.name?.slice(0, 1).toUpperCase() || "?"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#E5D1B8]">
                      {person.name || "Unknown user"}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#C2956E]">
                      Start a conversation
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#C2956E]/30 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-[#E5D1B8]/5 px-4 py-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DD8E58] text-sm font-bold text-[#2B2129]">
            {currentUser?.name?.slice(0, 2).toUpperCase() || "ME"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#E5D1B8]">
              {currentUser?.name || "Current User"}
            </p>
            <p className="truncate text-xs text-[#C2956E]">
              {currentUser?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
