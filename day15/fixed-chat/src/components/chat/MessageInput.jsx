import { useState } from "react";
import { Image, Paperclip, Send, Smile } from "lucide-react";

import { sendWebSocketMessage } from "../../services/webSocketService";

const MessageInput = ({ chat, currentUserId }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const receiverId = chat?.otherUser?.uid;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (
      !trimmedMessage ||
      !chat?.id ||
      !currentUserId ||
      !receiverId ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      await sendWebSocketMessage({
        type: "send_message",
        chatId: chat.id,
        receiverId,
        content: trimmedMessage,
      });

      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="border-t border-[#C2956E]/30 bg-[#2B2129] p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <button
          type="button"
          disabled={sending}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#C2956E]/30 text-[#C2956E] transition hover:border-[#DD8E58] hover:text-[#DD8E58] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Paperclip size={19} />
        </button>

        <button
          type="button"
          disabled={sending}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#C2956E]/30 text-[#C2956E] transition hover:border-[#DD8E58] hover:text-[#DD8E58] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Image size={19} />
        </button>

        <div className="relative flex-1">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            rows={1}
            placeholder="Write a message..."
            className="max-h-32 min-h-12 w-full resize-none rounded-2xl border border-[#C2956E]/30 bg-[#E5D1B8]/5 px-4 py-3 pr-12 text-sm text-[#E5D1B8] outline-none transition placeholder:text-[#C2956E] focus:border-[#DD8E58] disabled:opacity-50"
          />

          <button
            type="button"
            disabled={sending}
            className="absolute bottom-0 right-0 flex h-12 w-12 items-center justify-center text-[#C2956E] transition hover:text-[#DD8E58] disabled:opacity-50"
          >
            <Smile size={19} />
          </button>
        </div>

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#DD8E58] text-[#2B2129] transition hover:bg-[#C2956E] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={19} className={sending ? "animate-pulse" : ""} />
        </button>
      </form>

      <p className="mt-2 px-1 text-[11px] text-[#C2956E]">
        Press Enter to send · Shift + Enter for a new line
      </p>
    </div>
  );
};

export default MessageInput;
