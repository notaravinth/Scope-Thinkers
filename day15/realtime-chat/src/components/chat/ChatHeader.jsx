import { Phone, Video, MoreVertical } from "lucide-react";

const ChatHeader = ({ chat }) => {
  return (
    <header className="flex items-center justify-between border-b border-[#C2956E] px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#708A81] font-bold text-[#2B2129]">
          {chat.initials}

          {chat.status === "Online" && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#2B2129] bg-[#DD8E58]" />
          )}
        </div>

        <div>
          <h2 className="text-sm font-bold text-[#E5D1B8]">
            {chat.name}
          </h2>

          <p className="mt-0.5 text-xs text-[#C2956E]">
            {chat.status}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl text-[#C2956E] transition hover:bg-[#C2956E] hover:text-[#2B2129]">
          <Phone size={18} />
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl text-[#C2956E] transition hover:bg-[#C2956E] hover:text-[#2B2129]">
          <Video size={18} />
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl text-[#C2956E] transition hover:bg-[#C2956E] hover:text-[#2B2129]">
          <MoreVertical size={18} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;