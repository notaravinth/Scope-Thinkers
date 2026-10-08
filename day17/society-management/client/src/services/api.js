import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiFetch = async (path, options = {}) => {
  const firebaseUser = auth.currentUser;

  if (!firebaseUser) {
    throw new Error("You are not authenticated");
  }

  const token = await firebaseUser.getIdToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export default API_URL;
