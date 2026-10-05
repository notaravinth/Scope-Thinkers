const MessageBubble = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.mine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          message.mine
            ? "rounded-br-md bg-[#DD8E58] text-[#2B2129]"
            : "rounded-bl-md bg-[#E5D1B8] text-[#2B2129]"
        }`}
      >
        <p className="text-sm leading-6">
          {message.text}
        </p>

        <p className="mt-1 text-right text-[10px] opacity-60">
          {message.time}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;