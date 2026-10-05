import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
} from "lucide-react";

import { getFileBlob } from "../../services/fileService";

const MessageBubble = ({ message, isOwnMessage }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [fileError, setFileError] = useState(false);

  const attachment = message?.attachment;

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const loadAttachment = async () => {
      if (!attachment?.fileId) {
        return;
      }

      setIsLoadingFile(true);
      setFileError(false);

      try {
        const blob = await getFileBlob(attachment.fileId);

        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setFileUrl(objectUrl);
      } catch (error) {
        console.error("FAILED TO LOAD ATTACHMENT:", error);

        if (!cancelled) {
          setFileError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingFile(false);
        }
      }
    };

    loadAttachment();

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
    link.download = attachment?.name || "download";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const isImage =
    message?.type === "image" ||
    attachment?.mimeType?.startsWith("image/");

  const formatFileSize = (size) => {
    if (!size) {
      return "";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      className={`flex w-full ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isOwnMessage
            ? "rounded-br-md bg-[#DD8E58] text-[#2B2129]"
            : "rounded-bl-md bg-[#E5D1B8]/15 text-[#E5D1B8]"
        }`}
      >
        {/* IMAGE */}

        {isImage && attachment?.fileId && (
          <div className="mb-2 overflow-hidden rounded-xl">
            {isLoadingFile ? (
              <div
                className={`flex h-48 w-64 items-center justify-center ${
                  isOwnMessage
                    ? "bg-[#C2956E]/40"
                    : "bg-[#708A81]/20"
                }`}
              >
                <LoaderCircle
                  size={26}
                  className="animate-spin"
                />
              </div>
            ) : fileError ? (
              <div
                className={`flex h-32 w-64 flex-col items-center justify-center gap-2 ${
                  isOwnMessage
                    ? "bg-[#C2956E]/40"
                    : "bg-[#708A81]/20"
                }`}
              >
                <ImageIcon size={28} />

                <span className="text-xs">
                  Unable to load image
                </span>
              </div>
            ) : fileUrl ? (
              <img
                src={fileUrl}
                alt={attachment.name || "Shared image"}
                className="max-h-[400px] max-w-full rounded-xl object-contain"
              />
            ) : null}
          </div>
        )}

        {/* FILE */}

        {!isImage && attachment?.fileId && (
          <div
            className={`flex items-center gap-3 rounded-xl p-3 ${
              isOwnMessage
                ? "bg-[#2B2129]/10"
                : "bg-[#708A81]/15"
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                isOwnMessage
                  ? "bg-[#2B2129]/15"
                  : "bg-[#C2956E]/30"
              }`}
            >
              {isLoadingFile ? (
                <LoaderCircle
                  size={21}
                  className="animate-spin"
                />
              ) : (
                <FileText size={21} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {attachment.name || "File"}
              </p>

              {attachment.size && (
                <p className="text-xs opacity-70">
                  {formatFileSize(attachment.size)}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!fileUrl}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-[#DD8E58]/20 disabled:cursor-not-allowed disabled:opacity-40"
              title="Download file"
            >
              <Download size={18} />
            </button>
          </div>
        )}

        {/* TEXT */}

        {message?.content && (
          <p
            className={`whitespace-pre-wrap break-words ${
              attachment ? "mt-2" : ""
            }`}
          >
            {message.content}
          </p>
        )}

        {/* TIME */}

        {message?.createdAt && (
          <div
            className={`mt-1 text-right text-[10px] opacity-60`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;