import { useState } from "react";
import { useNavigate } from "react-router-dom";

const generateRoomId = () => {
  return Math.random()
    .toString(36)
    .substring(2, 10);
};

const HomePage = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] =
    useState("");

  const createRoom = () => {
    const newRoomId =
      generateRoomId();

    navigate(
      `/room/${newRoomId}`
    );
  };

  const joinRoom = () => {
    const trimmedRoomId =
      roomId.trim();

    if (!trimmedRoomId) return;

    navigate(
      `/room/${trimmedRoomId}`
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            CollabBoard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Create or join a collaborative
            whiteboard
          </p>
        </div>

        <button
          onClick={createRoom}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Create New Room
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span  className="text-sm text-gray-400">
            OR
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={roomId}
            onChange={(event) =>
              setRoomId(
                event.target.value
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                joinRoom();
              }
            }}
            placeholder="Enter room ID"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={joinRoom}
            disabled={!roomId.trim()}
            className="w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;