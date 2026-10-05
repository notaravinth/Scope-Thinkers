import { auth } from "../firebase/firebase";

const getServerUrl = () => {
  const configuredUrl = import.meta.env.VITE_SERVER_URL;

  if (configuredUrl) {
    return configuredUrl;
  }

  return `http://${window.location.hostname}:8080`;
};

export const uploadFile = async (file, chatId) => {
  if (!file) {
    throw new Error("No file selected.");
  }

  if (!chatId) {
    throw new Error("Chat ID is required.");
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in.");
  }

  const token = await currentUser.getIdToken();

  const formData = new FormData();

  formData.append("file", file);
  formData.append("chatId", chatId);

  const response = await fetch(
    `${getServerUrl()}/api/files/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to upload file."
    );
  }

  return data;
};

export const getFileBlob = async (fileId) => {
  if (!fileId) {
    throw new Error("File ID is required.");
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in.");
  }

  const token = await currentUser.getIdToken();

  const response = await fetch(
    `${getServerUrl()}/api/files/${fileId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.message || "Failed to retrieve file."
    );
  }

  return await response.blob();
};

export const getFileUrl = (fileId) => {
  return `${getServerUrl()}/api/files/${fileId}`;
};