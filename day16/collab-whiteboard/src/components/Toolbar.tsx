import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  Circle,
  GripVertical,
  Layers,
  RectangleHorizontal,
  Type,
  ArrowRight,
  Minus,
  LogOut,
  Trash2,
} from "lucide-react";

import { useWhiteboardStore } from "../store/whiteboardStore";

import type {
  Shape,
  ShapeType,
} from "../types/whiteboard";

interface ToolbarProps {
  roomId: string;
  onAddShape: (shape: Shape) => void;
  onDeleteShape: (shapeId: string) => void;
  onLeaveRoom: () => void;
  onUpdateShape: (shape: Shape) => void;
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
  onUpdateShape,
}: ToolbarProps) => {
  const shapes =
    useWhiteboardStore(
      (state) => state.shapes
    );

  const addShape =
    useWhiteboardStore(
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

  const selectShape =
    useWhiteboardStore(
      (state) =>
        state.selectShape
    );

  const updateShape =
    useWhiteboardStore(
      (state) =>
        state.updateShape
    );

  const sortedShapes = [
    ...shapes,
  ].sort(
    (a, b) =>
      (b.zIndex ?? 0) -
      (a.zIndex ?? 0)
  );

  const createShape = (
    type: ShapeType
  ) => {
    const highestZIndex =
      shapes.reduce(
        (highest, shape) =>
          Math.max(
            highest,
            shape.zIndex ?? 0
          ),
        -1
      );

    const baseShape = {
      id: generateId(),
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      color: "#111827",
      zIndex:
        highestZIndex + 1,
      rotation: 0,
    };

    let shape: Shape;

    if (
      type === "rectangle"
    ) {
      shape = {
        ...baseShape,
        type,
        x: 200,
        y: 150,
        width: 150,
        height: 100,
        color: "#2563eb",
      };
    } else if (
      type === "circle"
    ) {
      shape = {
        ...baseShape,
        type,
        x: 400,
        y: 200,
        width: 120,
        height: 120,
        color: "#9333ea",
      };
    } else if (
      type === "line"
    ) {
      shape = {
        ...baseShape,
        type,
        x: 250,
        y: 350,
        width: 220,
        height: 12,
      };
    } else if (
      type === "arrow"
    ) {
      shape = {
        ...baseShape,
        type,
        x: 300,
        y: 450,
        width: 220,
        height: 12,
      };
    } else {
      shape = {
        ...baseShape,
        type,
        x: 300,
        y: 280,
        width: 220,
        height: 50,
        text: "Double-click to edit",
      };
    }

    addShape(
      shape,
      roomId
    );

    onAddShape(shape);
  };

  const handleDelete = () => {
    if (!selectedShapeId) {
      return;
    }

    deleteShape(
      selectedShapeId,
      roomId
    );

    onDeleteShape(
      selectedShapeId
    );
  };

  const handleLayerDragEnd = (
    event: DragEndEvent
  ) => {
    const {
      active,
      over,
    } = event;

    if (!over) return;

    if (
      active.id === over.id
    ) {
      return;
    }

    const oldIndex =
      sortedShapes.findIndex(
        (shape) =>
          shape.id ===
          active.id
      );

    const newIndex =
      sortedShapes.findIndex(
        (shape) =>
          shape.id ===
          over.id
      );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    const reorderedShapes =
      arrayMove(
        sortedShapes,
        oldIndex,
        newIndex
      );

    const totalLayers =
      reorderedShapes.length;

    reorderedShapes.forEach(
      (shape, index) => {
        const newZIndex =
          totalLayers -
          index -
          1;

        if (
          shape.zIndex ===
          newZIndex
        ) {
          return;
        }

        const updatedShape: Shape =
          {
            ...shape,
            zIndex:
              newZIndex,
          };

        updateShape(
          shape.id,
          {
            zIndex:
              newZIndex,
          },
          roomId
        );

        onUpdateShape(
          updatedShape
        );
      }
    );
  };

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center border-b border-gray-200 px-5">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900">
            CollabBoard
          </h1>

          <p className="truncate text-xs text-gray-400">
            Room: {roomId}
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <Layers size={14} />

          Tools
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ToolButton
            label="Rectangle"
            icon={
              <RectangleHorizontal
                size={17}
              />
            }
            onClick={() =>
              createShape(
                "rectangle"
              )
            }
          />

          <ToolButton
            label="Circle"
            icon={
              <Circle size={17} />
            }
            onClick={() =>
              createShape(
                "circle"
              )
            }
          />

          <ToolButton
            label="Line"
            icon={
              <Minus size={17} />
            }
            onClick={() =>
              createShape("line")
            }
          />

          <ToolButton
            label="Arrow"
            icon={
              <ArrowRight
                size={17}
              />
            }
            onClick={() =>
              createShape("arrow")
            }
          />

          <ToolButton
            label="Text"
            icon={
              <Type size={17} />
            }
            onClick={() =>
              createShape("text")
            }
          />

          <button
            disabled={
              !selectedShapeId
            }
            onClick={
              handleDelete
            }
            className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2
              size={17}
            />

            Delete
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <Layers size={14} />

            Layers
          </div>

          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
            {shapes.length}
          </span>
        </div>

        <DndContext
          collisionDetection={
            closestCenter
          }
          onDragEnd={
            handleLayerDragEnd
          }
        >
          <SortableContext
            items={sortedShapes.map(
              (shape) =>
                shape.id
            )}
            strategy={
              verticalListSortingStrategy
            }
          >
            <div className="max-h-full space-y-1 overflow-y-auto">
              {sortedShapes.map(
                (shape) => (
                  <SortableLayer
                    key={shape.id}
                    shape={shape}
                    selected={
                      selectedShapeId ===
                      shape.id
                    }
                    onSelect={() =>
                      selectShape(
                        shape.id
                      )
                    }
                  />
                )
              )}
            </div>
          </SortableContext>
        </DndContext>

        {shapes.length ===
          0 && (
          <div className="rounded-lg border border-dashed border-gray-200 p-5 text-center text-xs text-gray-400">
            No layers yet.
            <br />
            Add an object to begin.
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <button
          onClick={
            onLeaveRoom
          }
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut size={17} />

          Leave Room
        </button>
      </div>
    </aside>
  );
};

interface ToolButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ToolButton = ({
  label,
  icon,
  onClick,
}: ToolButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-left text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
    >
      {icon}

      {label}
    </button>
  );
};

interface SortableLayerProps {
  shape: Shape;
  selected: boolean;
  onSelect: () => void;
}

const SortableLayer = ({
  shape,
  selected,
  onSelect,
}: SortableLayerProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: shape.id,
  });

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),
    transition,
  };

  const getLayerName = () => {
    if (
      shape.type ===
      "rectangle"
    ) {
      return "Rectangle";
    }

    if (
      shape.type ===
      "circle"
    ) {
      return "Circle";
    }

    if (
      shape.type === "line"
    ) {
      return "Line";
    }

    if (
      shape.type === "arrow"
    ) {
      return "Arrow";
    }

    return (
      shape.text || "Text"
    );
  };

  const getIcon = () => {
    if (
      shape.type ===
      "rectangle"
    ) {
      return (
        <RectangleHorizontal
          size={15}
        />
      );
    }

    if (
      shape.type === "circle"
    ) {
      return (
        <Circle size={15} />
      );
    }

    if (
      shape.type === "line"
    ) {
      return (
        <Minus size={15} />
      );
    }

    if (
      shape.type === "arrow"
    ) {
      return (
        <ArrowRight
          size={15}
        />
      );
    }

    return (
      <Type size={15} />
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={`flex items-center gap-2 rounded-lg border px-2 py-2 transition ${
        isDragging
          ? "z-50 border-blue-300 bg-blue-50 shadow-lg"
          : selected
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-transparent hover:bg-gray-50"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(event) =>
          event.stopPropagation()
        }
        className="cursor-grab touch-none text-gray-400 active:cursor-grabbing"
      >
        <GripVertical
          size={17}
        />
      </button>

      <span
        className="flex h-7 w-7 items-center justify-center rounded-md"
        style={{
          color:
            shape.color,
        }}
      >
        {getIcon()}
      </span>

      <span className="min-w-0 flex-1 truncate text-xs font-medium">
        {getLayerName()}
      </span>

      {selected && (
        <span className="text-[10px] font-semibold text-blue-500">
          Selected
        </span>
      )}
    </div>
  );
};

export default Toolbar;