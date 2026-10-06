import { useWhiteboardStore } from "../store/whiteboardStore";
import type { Shape } from "../types/whiteboard";

interface ToolbarProps {
  roomId: string;
  onAddShape: (shape: Shape) => void;
  onDeleteShape: (shapeId: string) => void;
  onLeaveRoom: () => void;
}

const generateId = () => {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 11)}`;
};

const Toolbar = ({
  roomId,
  onAddShape,
  onDeleteShape,
  onLeaveRoom,
}: ToolbarProps) => {
  const addShape = useWhiteboardStore(
    (state) => state.addShape
  );

  const selectedShapeId =
    useWhiteboardStore(
      (state) =>
        state.selectedShapeId
    );

  const deleteShape =
    useWhiteboardStore(
      (state) => state.deleteShape
    );

  const createRectangle = () => {
    const shape: Shape = {
      id: generateId(),
      type: "rectangle",
      x: 200,
      y: 150,
      width: 150,
      height: 100,
      color: "#2563eb",
    };

    addShape(shape, roomId);

    onAddShape(shape);
  };

  const createCircle = () => {
    const shape: Shape = {
      id: generateId(),
      type: "circle",
      x: 400,
      y: 200,
      width: 120,
      height: 120,
      color: "#9333ea",
    };

    addShape(shape, roomId);

    onAddShape(shape);
  };

  const handleDelete = () => {
    if (!selectedShapeId) return;

    deleteShape(
      selectedShapeId,
      roomId
    );

    onDeleteShape(
      selectedShapeId
    );
  };

  return (
    <div className="flex h-16 items-center gap-3 border-b bg-white px-5">
      <h1 className="mr-3 text-lg font-semibold">
        CollabBoard
      </h1>

      <div className="mr-3 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
        Room:{" "}
        <span className="font-medium text-gray-900">
          {roomId}
        </span>
      </div>

      <button
        onClick={createRectangle}
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white transition hover:bg-blue-600"
      >
        Rectangle
      </button>

      <button
        onClick={createCircle}
        className="rounded-lg bg-purple-500 px-4 py-2 text-sm text-white transition hover:bg-purple-600"
      >
        Circle
      </button>

      <button
        disabled={!selectedShapeId}
        onClick={handleDelete}
        className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Delete
      </button>

      <div className="ml-auto">
        <button
          onClick={onLeaveRoom}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default Toolbar;