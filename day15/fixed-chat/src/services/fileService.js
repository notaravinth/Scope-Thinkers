import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { storage } from "../firebase/firebase";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const MAX_ATTACHMENT_SIZE = MAX_FILE_SIZE;

export const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
};

const sanitizeFileName = (fileName) => {
  const extensionIndex = fileName.lastIndexOf(".");
  const name = extensionIndex > 0 ? fileName.slice(0, extensionIndex) : fileName;
  const extension = extensionIndex > 0 ? fileName.slice(extensionIndex) : "";

  const safeName = name
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

  return `${safeName || "file"}${extension.slice(0, 12)}`;
};

export const isImageFile = (file) => {
  return Boolean(file?.type?.startsWith("image/"));
};

export const uploadChatAttachment = ({
  file,
  chatId,
  userId,
  onProgress,
}) => {
  if (!file) {
    return Promise.reject(new Error("No file selected."));
  }

  if (!chatId || !userId) {
    return Promise.reject(
      new Error("Chat and user information are required."),
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return Promise.reject(
      new Error("Files must be 25 MB or smaller."),
    );
  }

  const safeFileName = sanitizeFileName(file.name);
  const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;
  const storagePath = `chatter/${chatId}/${userId}/${uniqueFileName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || "application/octet-stream",
      customMetadata: {
        originalName: file.name,
        uploadedBy: userId,
        chatId,
      },
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          snapshot.totalBytes > 0
            ? Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              )
            : 0;

        onProgress?.(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          resolve({
            url: downloadURL,
            name: file.name,
            size: file.size,
            mimeType: file.type || "application/octet-stream",
            storagePath,
          });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
};
