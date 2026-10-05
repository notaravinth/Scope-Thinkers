import { useEffect, useState } from "react";
import {
  Download,
  File,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
} from "lucide-react";

import { getFileBlob } from "../../services/fileService";

const MessageList = ({ messages = [], currentUserId }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return `${bytes} B`;

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;

    return `${mb.toFixed(1)} MB`;
  };

  const isImage = (message) =>
    message.type === "image" ||
    message.attachment?.mimeType?.startsWith("image/");

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
          const isMine =
            message.senderId === currentUserId;

          const imageMessage = isImage(message);

          const attachment = message.attachment;

          return (
            <MessageItem
              key={
                message.id ||
                `${message.chatId}-${message.createdAt}-${index}`
              }
              message={message}
              attachment={attachment}
              imageMessage={imageMessage}
              isMine={isMine}
              formatTime={formatTime}
              formatFileSize={formatFileSize}
            />
          );
        })}

      </div>
    </div>
  );
};

/* =========================================================
   INDIVIDUAL MESSAGE
========================================================= */

const MessageItem = ({
  message,
  attachment,
  imageMessage,
  isMine,
  formatTime,
  formatFileSize,
}) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const loadFile = async () => {
      if (!attachment?.fileId) {
        return;
      }

      try {
        setLoadingFile(true);
        setFileError(false);

        const blob = await getFileBlob(
          attachment.fileId,
        );

        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);

        setFileUrl(objectUrl);
      } catch (error) {
        console.error(
          "FAILED TO LOAD ATTACHMENT:",
          error,
        );

        if (!cancelled) {
          setFileError(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingFile(false);
        }
      }
    };

    loadFile();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachment?.fileId]);

  const handleDownload = () => {
    if (!fileUrl) {
      return;
    }

    const link = document.createElement("a");

    link.href = fileUrl;

    link.download =
      attachment?.name || "download";

    document.body.appendChild(link);

    link.click();

    link.remove();
  };

  return (
    <div
      className={`flex w-full ${
        isMine
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[70%] flex-col ${
          isMine
            ? "items-end"
            : "items-start"
        }`}
      >

        {/* =================================================
            IMAGE
        ================================================= */}

        {imageMessage &&
          attachment?.fileId && (
            <div
              className={`overflow-hidden rounded-2xl border border-[#C2956E]/30 ${
                isMine
                  ? "rounded-br-md"
                  : "rounded-bl-md"
              }`}
            >
              {loadingFile ? (
                <div
                  className={`flex h-48 w-64 items-center justify-center ${
                    isMine
                      ? "bg-[#DD8E58]"
                      : "bg-[#708A81]"
                  }`}
                >
                  <LoaderCircle
                    size={28}
                    className={
                      isMine
                        ? "text-[#2B2129] animate-spin"
                        : "text-[#E5D1B8] animate-spin"
                    }
                  />
                </div>
              ) : fileError ? (
                <div
                  className={`flex h-32 w-64 flex-col items-center justify-center gap-2 ${
                    isMine
                      ? "bg-[#DD8E58] text-[#2B2129]"
                      : "bg-[#708A81] text-[#E5D1B8]"
                  }`}
                >
                  <ImageIcon size={28} />

                  <span className="text-xs">
                    Unable to load image
                  </span>
                </div>
              ) : fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={fileUrl}
                    alt={
                      attachment.name ||
                      "Shared image"
                    }
                    className="max-h-[360px] max-w-[360px] object-cover transition hover:opacity-90"
                  />
                </a>
              ) : null}
            </div>
          )}

        {/* =================================================
            FILE
        ================================================= */}

        {!imageMessage &&
          message.type === "file" &&
          attachment?.fileId && (
            <div
              className={`flex min-w-[240px] items-center gap-3 rounded-2xl border border-[#C2956E]/30 px-4 py-3 ${
                isMine
                  ? "rounded-br-md bg-[#DD8E58] text-[#2B2129]"
                  : "rounded-bl-md bg-[#708A81] text-[#E5D1B8]"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2B2129]/20">
                {loadingFile ? (
                  <LoaderCircle
                    size={19}
                    className="animate-spin"
                  />
                ) : attachment.mimeType ===
                  "application/pdf" ? (
                  <FileText size={19} />
                ) : (
                  <File size={19} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {attachment.name ||
                    "Shared file"}
                </p>

                <p className="mt-1 text-[11px] opacity-70">
                  {formatFileSize(
                    attachment.size,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!fileUrl}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-[#C2956E]/30 disabled:cursor-not-allowed disabled:opacity-40"
                title="Download file"
              >
                <Download size={17} />
              </button>
            </div>
          )}

        {/* =================================================
            NORMAL TEXT
        ================================================= */}

        {!attachment && (
          <div
            className={`break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isMine
                ? "rounded-br-md bg-[#DD8E58] text-[#2B2129]"
                : "rounded-bl-md bg-[#708A81] text-[#E5D1B8]"
            }`}
          >
            {message.content}
          </div>
        )}

        {/* =================================================
            TEXT ATTACHED TO IMAGE / FILE
        ================================================= */}

        {message.content &&
          attachment && (
            <div
              className={`mt-2 break-words rounded-xl px-3 py-2 text-sm ${
                isMine
                  ? "bg-[#DD8E58] text-[#2B2129]"
                  : "bg-[#708A81] text-[#E5D1B8]"
              }`}
            >
              {message.content}
            </div>
          )}

        {/* =================================================
            TIME
        ================================================= */}

        <div className="mt-1 px-1 text-[10px] text-[#C2956E]">
          {formatTime(message.createdAt)}
        </div>

      </div>
    </div>
  );
};

export default MessageList;