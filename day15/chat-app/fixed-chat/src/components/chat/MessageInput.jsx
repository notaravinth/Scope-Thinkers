import { useRef, useState } from "react";
import {
  Paperclip,
  Image,
  Send,
  X,
  LoaderCircle,
} from "lucide-react";

import { uploadFile } from "../../services/fileService";
import { sendWebSocketMessage } from "../../services/webSocketService";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const MessageInput = ({
  chat,
  currentUserId,
}) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  /* =====================================================
     FILE SELECTION
  ===================================================== */

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File size cannot exceed 25 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    event.target.value = "";
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Image size cannot exceed 25 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    event.target.value = "";
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const handleSend = async () => {
    if (!chat?.id || !currentUserId) {
      console.error("Missing chat or current user:", {
        chat,
        currentUserId,
      });

      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage && !selectedFile) {
      return;
    }

    const receiverId = chat?.otherUser?.uid;

    if (!receiverId) {
      console.error(
        "Could not find receiver ID:",
        chat,
      );

      alert("Could not determine the recipient.");
      return;
    }

    try {
      setIsUploading(true);

      /* =================================================
         IMAGE / FILE MESSAGE
      ================================================= */

      if (selectedFile) {
        console.log(
          "Uploading file:",
          selectedFile.name,
        );

        const uploadedFile = await uploadFile(
          selectedFile,
          chat.id,
        );

        console.log(
          "File uploaded successfully:",
          uploadedFile,
        );

        const isImage =
          selectedFile.type.startsWith("image/");

        await sendWebSocketMessage({
          type: "send_message",
          chatId: chat.id,
          receiverId,
          content: trimmedMessage,
          messageType: isImage ? "image" : "file",
          attachment: {
            fileId: uploadedFile.fileId,
            name: uploadedFile.name,
            mimeType: uploadedFile.mimeType,
            size: uploadedFile.size,
          },
        });

        setSelectedFile(null);
        setMessage("");

        return;
      }

      /* =================================================
         NORMAL TEXT MESSAGE
      ================================================= */

      console.log("Sending text message:", {
        chatId: chat.id,
        receiverId,
        content: trimmedMessage,
      });

      await sendWebSocketMessage({
        type: "send_message",
        chatId: chat.id,
        receiverId,
        content: trimmedMessage,
        messageType: "text",
      });

      setMessage("");
    } catch (error) {
      console.error(
        "MESSAGE SEND ERROR:",
        error,
      );

      alert(
        error?.message ||
          "Something went wrong while sending the message.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  /* =====================================================
     ENTER TO SEND
  ===================================================== */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSend();
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="border-t border-[#708A81]/30 bg-[#2B2129] p-4">

      {/* =================================================
          FILE PREVIEW
      ================================================= */}

      {selectedFile && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[#708A81]/40 bg-[#E5D1B8]/10 p-3">

          {selectedFile.type.startsWith("image/") ? (
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#C2956E]/30">
              <Image
                size={22}
                className="text-[#E5D1B8]"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C2956E]/30">
              <Paperclip
                size={22}
                className="text-[#E5D1B8]"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#E5D1B8]">
              {selectedFile.name}
            </p>

            <p className="text-xs text-[#708A81]">
              {(
                selectedFile.size /
                1024 /
                1024
              ).toFixed(2)}{" "}
              MB
            </p>
          </div>

          <button
            type="button"
            onClick={removeSelectedFile}
            disabled={isUploading}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#E5D1B8] transition hover:bg-[#DD8E58]/20 hover:text-[#DD8E58]"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* =================================================
          INPUT ROW
      ================================================= */}

      <div className="flex items-end gap-3">

        {/* IMAGE INPUT */}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* FILE INPUT */}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* IMAGE BUTTON */}

        <button
          type="button"
          onClick={() =>
            imageInputRef.current?.click()
          }
          disabled={isUploading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#E5D1B8] transition hover:bg-[#708A81]/20 hover:text-[#DD8E58] disabled:cursor-not-allowed disabled:opacity-50"
          title="Send image"
        >
          <Image size={21} />
        </button>

        {/* FILE BUTTON */}

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={isUploading}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#E5D1B8] transition hover:bg-[#708A81]/20 hover:text-[#DD8E58] disabled:cursor-not-allowed disabled:opacity-50"
          title="Send file"
        >
          <Paperclip size={21} />
        </button>

        {/* TEXT INPUT */}

        <div className="flex min-h-11 flex-1 items-center rounded-2xl border border-[#708A81]/40 bg-[#E5D1B8]/10 px-4 transition focus-within:border-[#DD8E58]/60">

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={
              selectedFile
                ? "Add a message..."
                : "Type a message..."
            }
            rows={1}
            disabled={isUploading}
            className="max-h-32 min-h-6 w-full resize-none bg-transparent py-2 text-sm text-[#E5D1B8] outline-none placeholder:text-[#708A81]"
          />

        </div>

        {/* SEND BUTTON */}

        <button
          type="button"
          onClick={handleSend}
          disabled={
            isUploading ||
            (!message.trim() && !selectedFile)
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DD8E58] text-[#2B2129] transition hover:bg-[#C2956E] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUploading ? (
            <LoaderCircle
              size={20}
              className="animate-spin"
            />
          ) : (
            <Send size={19} />
          )}
        </button>

      </div>
    </div>
  );
};

export default MessageInput;