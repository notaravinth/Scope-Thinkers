import { useEffect, useRef } from "react";

const MessageList = ({ messages = [], currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5D1B8]/5 text-xl">
            💬
          </div>
          <h3 className="text-sm font-semibold text-[#E5D1B8]">
            No messages yet
          </h3>
          <p className="mt-1 text-xs text-[#C2956E]">
            Send the first message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {messages.map((message, index) => {
          const isMine = message.senderId === currentUserId;

          return (
            <div
              key={
                message.id ||
                `${message.chatId}-${message.createdAt}-${index}`
              }
              className={`flex w-full ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[70%] flex-col ${
                  isMine ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isMine
                      ? "rounded-br-md bg-[#DD8E58] text-[#2B2129]"
                      : "rounded-bl-md bg-[#708A81] text-[#E5D1B8]"
                  }`}
                >
                  {message.content}
                </div>

                <div className="mt-1 px-1 text-[10px] text-[#C2956E]">
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;
