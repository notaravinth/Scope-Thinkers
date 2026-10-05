import { Search, MessageCircle, Users } from "lucide-react";

const ChatSidebar = ({
  currentUser,
  users,
  chats,
  activeChat,
  search,
  setSearch,
  onSelectUser,
  onSelectChat,
  getOtherUser,
  loading,
}) => {
  /*
   * Remove duplicate conversations for the same user.
   *
   * If multiple chat documents exist between the
   * same two users, only the most recently updated
   * conversation is displayed.
   */
  const uniqueChats = [];

  const seenUsers = new Set();

  const sortedChats = [...chats].sort((a, b) => {
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

  sortedChats.forEach((chat) => {
    const otherUser = getOtherUser(chat);

    if (!otherUser) {
      return;
    }

    if (seenUsers.has(otherUser.uid)) {
      return;
    }

    seenUsers.add(otherUser.uid);

    uniqueChats.push({
      ...chat,
      otherUser,
    });
  });

  /*
   * Users who don't already have a conversation
   * are shown under "PEOPLE".
   */
  const conversationUserIds = new Set(
    uniqueChats.map((chat) => chat.otherUser.uid),
  );

  const availableUsers = users.filter(
    (item) => !conversationUserIds.has(item.uid),
  );

  const formatLastMessage = (chat) => {
    if (!chat.lastMessage) {
      return "No messages yet";
    }

    return chat.lastMessage;
  };

  return (
    <aside className="flex h-full w-[420px] shrink-0 flex-col border-r border-[#C2956E]/30 bg-[#2B2129]">
      {/* Header */}
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

        {/* Search */}
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

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Conversations */}
        <div className="px-4 py-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle size={14} className="text-[#DD8E58]" />

            <p className="text-xs font-semibold tracking-[0.18em] text-[#C2956E]">
              CONVERSATIONS
            </p>
          </div>

          {loading ? (
            <div className="px-2 py-4 text-sm text-[#C2956E]">
              Loading conversations...
            </div>
          ) : uniqueChats.length === 0 ? (
            <div className="rounded-2xl border border-[#C2956E]/20 bg-[#E5D1B8]/5 px-4 py-5 text-center">
              <p className="text-sm text-[#C2956E]">No conversations yet.</p>
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
                        : "bg-transparent text-[#E5D1B8] hover:bg-[#E5D1B8]/5"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-bold ${
                        isActive
                          ? "bg-[#2B2129] text-[#DD8E58]"
                          : "bg-[#708A81] text-[#E5D1B8]"
                      }`}
                    >
                      {otherUser?.name?.slice(0, 1).toUpperCase() || "?"}
                    </div>

                    {/* Chat information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className={`truncate text-sm font-semibold ${
                            isActive ? "text-[#2B2129]" : "text-[#E5D1B8]"
                          }`}
                        >
                          {otherUser?.name || "Unknown user"}
                        </p>
                      </div>

                      <p
                        className={`mt-1 truncate text-xs ${
                          isActive ? "text-[#2B2129]/70" : "text-[#C2956E]"
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

        {/* People */}
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

      {/* Current user */}
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
