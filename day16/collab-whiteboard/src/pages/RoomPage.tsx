import {
  useCallback,
  useEffect,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Canvas from "../components/Canvas";
import Toolbar from "../components/Toolbar";
import useWebSocket from "../hooks/useWebSocket";

import { loadBoard } from "../db/boardStorage";

import {
  useWhiteboardStore,
} from "../store/whiteboardStore";

import type { ServerMessage } from "../types/websocket";

import type { Shape } from "../types/whiteboard";

const RoomPage = () => {
  const {
    roomId,
  } = useParams<{
    roomId: string;
  }>();

  const navigate =
    useNavigate();

  const setShapes =
    useWhiteboardStore(
      (state) =>
        state.setShapes
    );

  const setShape =
    useWhiteboardStore(
      (state) =>
        state.setShape
    );

  const deleteShape =
    useWhiteboardStore(
      (state) =>
        state.deleteShape
    );

  useEffect(() => {
    if (!roomId) return;

    const loadLocalBoard =
      async () => {
        const shapes =
          await loadBoard(
            roomId
          );

        setShapes(
          shapes
        );
      };

    void loadLocalBoard();
  }, [
    roomId,
    setShapes,
  ]);

  const handleMessage =
    useCallback(
      (
        message: ServerMessage
      ) => {
        if (
          message.type ===
          "ROOM_JOINED"
        ) {
          console.log(
            `Joined room: ${message.roomId}`
          );

          return;
        }

        if (
          message.type ===
          "ROOM_STATE"
        ) {
          setShapes(
            message.shapes
          );

          return;
        }

        if (
          message.type ===
          "ADD_SHAPE"
        ) {
          setShape(
            message.shape
          );

          return;
        }

        if (
          message.type ===
          "UPDATE_SHAPE"
        ) {
          setShape(
            message.shape
          );

          return;
        }

        if (
          message.type ===
          "DELETE_SHAPE"
        ) {
          deleteShape(
            message.shapeId,
            message.roomId
          );
        }
      },
      [
        setShapes,
        setShape,
        deleteShape,
      ]
    );

  const {
    addShape,
    updateShape,
    deleteShape:
      sendDeleteShape,
  } = useWebSocket({
    roomId:
      roomId ?? "",
    onMessage:
      handleMessage,
  });

  const handleUpdateShape =
    useCallback(
      (shape: Shape) => {
        updateShape(
          shape
        );
      },
      [updateShape]
    );

  if (!roomId) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Toolbar
        roomId={roomId}
        onAddShape={
          addShape
        }
        onDeleteShape={
          sendDeleteShape
        }
        onLeaveRoom={() =>
          navigate("/")
        }
        onUpdateShape={
          handleUpdateShape
        }
      />

      <Canvas
        roomId={roomId}
        onUpdateShape={
          handleUpdateShape
        }
      />
    </div>
  );
};

export default RoomPage;