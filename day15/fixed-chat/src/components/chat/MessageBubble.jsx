const MessageBubble = ({ message, isMine }) => {
  if (!message) return null;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] break-words rounded-2xl px-4 py-3 text-sm ${
          isMine
            ? "rounded-br-md bg-[#DD8E58] text-[#2B2129]"
            : "rounded-bl-md bg-[#708A81] text-[#E5D1B8]"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
