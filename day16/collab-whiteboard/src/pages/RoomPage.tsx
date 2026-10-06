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
import { useWhiteboardStore } from "../store/whiteboardStore";
import type { Shape } from "../types/whiteboard";

export type ServerMessage =
  | {
      type: "ROOM_JOINED";
      roomId: string;
    }
  | {
      type: "ROOM_STATE";
      roomId: string;
      shapes: Shape[];
    }
  | {
      type: "ADD_SHAPE";
      roomId: string;
      shape: Shape;
    }
  | {
      type: "UPDATE_SHAPE";
      roomId: string;
      shape: Shape;
    }
  | {
      type: "DELETE_SHAPE";
      roomId: string;
      shapeId: string;
    };

const RoomPage = () => {
  const { roomId } =
    useParams<{
      roomId: string;
    }>();

  const navigate = useNavigate();

  const setShapes =
    useWhiteboardStore(
      (state) => state.setShapes
    );

  const setShape =
    useWhiteboardStore(
      (state) => state.setShape
    );

  const deleteShape =
    useWhiteboardStore(
      (state) => state.deleteShape
    );

  useEffect(() => {
    if (!roomId) return;

    const loadLocalBoard =
      async () => {
        const shapes =
          await loadBoard(roomId);

        setShapes(shapes);
      };

    void loadLocalBoard();
  }, [roomId, setShapes]);

  const handleMessage =
    useCallback(
      (message: ServerMessage) => {
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

          return;
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
    roomId: roomId ?? "",
    onMessage:
      handleMessage,
  });

  if (!roomId) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Toolbar
        roomId={roomId}
        onAddShape={addShape}
        onDeleteShape={
          sendDeleteShape
        }
        onLeaveRoom={() =>
          navigate("/")
        }
      />

      <Canvas
        roomId={roomId}
        onUpdateShape={
          updateShape
        }
      />
    </div>
  );
};

export default RoomPage;