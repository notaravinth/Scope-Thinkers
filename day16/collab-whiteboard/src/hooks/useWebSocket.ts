import { useEffect, useRef } from "react";
import type { Shape } from "../types/whiteboard";
import type { ServerMessage } from "../types/websocket";

interface UseWebSocketProps {
  roomId: string;
  onMessage: (message: ServerMessage) => void;
}

const useWebSocket = ({
  roomId,
  onMessage,
}: UseWebSocketProps) => {
  const socketRef =
    useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const protocol =
      window.location.protocol === "https:"
        ? "wss:"
        : "ws:";

    const host =
      window.location.hostname;

    const socketUrl =
      `${protocol}//${host}:8080`;

    console.log(
      "Connecting to WebSocket:",
      socketUrl
    );

    const socket =
      new WebSocket(socketUrl);

    socketRef.current = socket;

    socket.onopen = () => {
      console.log(
        "WebSocket connected"
      );

      socket.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId,
        })
      );
    };

    socket.onmessage = (
      event
    ) => {
      try {
        const message: ServerMessage =
          JSON.parse(
            event.data
          );

        onMessage(message);
      } catch (error) {
        console.error(
          "Invalid WebSocket message:",
          error
        );
      }
    };

    socket.onerror = (
      error
    ) => {
      console.error(
        "WebSocket error:",
        error
      );
    };

    socket.onclose = () => {
      console.log(
        "WebSocket disconnected"
      );
    };

    return () => {
      socket.close();

      socketRef.current =
        null;
    };
  }, [roomId, onMessage]);

  const sendMessage = (
    message: object
  ) => {
    const socket =
      socketRef.current;

    if (!socket) return;

    if (
      socket.readyState !==
      WebSocket.OPEN
    ) {
      console.warn(
        "WebSocket is not connected"
      );

      return;
    }

    socket.send(
      JSON.stringify(message)
    );
  };

  const addShape = (
    shape: Shape
  ) => {
    sendMessage({
      type: "ADD_SHAPE",
      roomId,
      shape,
    });
  };

  const updateShape = (
    shape: Shape
  ) => {
    sendMessage({
      type: "UPDATE_SHAPE",
      roomId,
      shape,
    });
  };

  const deleteShape = (
    shapeId: string
  ) => {
    sendMessage({
      type: "DELETE_SHAPE",
      roomId,
      shapeId,
    });
  };

  return {
    addShape,
    updateShape,
    deleteShape,
  };
};

export default useWebSocket;