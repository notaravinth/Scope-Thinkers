import { useRef } from "react";
import { useWhiteboardStore } from "../store/whiteboardStore";
import type { Shape } from "../types/whiteboard";

type ResizeDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface CanvasProps {
  roomId: string;
  onUpdateShape: (shape: Shape) => void;
}

interface ResizeHandleProps {
  position: ResizeDirection;
  onPointerDown: (
    event: React.PointerEvent<HTMLDivElement>
  ) => void;
}

const Canvas = ({
  roomId,
  onUpdateShape,
}: CanvasProps) => {
  const shapes = useWhiteboardStore(
    (state) => state.shapes
  );

  const selectedShapeId = useWhiteboardStore(
    (state) => state.selectedShapeId
  );

  const selectShape = useWhiteboardStore(
    (state) => state.selectShape
  );

  const updateShape = useWhiteboardStore(
    (state) => state.updateShape
  );

  const draggingShapeId =
    useRef<string | null>(null);

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });

  const resizingShapeId =
    useRef<string | null>(null);

  const resizeDirection =
    useRef<ResizeDirection | null>(
      null
    );

  const resizeStart = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    shapeX: 0,
    shapeY: 0,
  });

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    shapeId: string
  ) => {
    event.stopPropagation();

    const shape = shapes.find(
      (shape) => shape.id === shapeId
    );

    if (!shape) return;

    selectShape(shapeId);

    draggingShapeId.current =
      shapeId;

    dragOffset.current = {
      x: event.clientX - shape.x,
      y: event.clientY - shape.y,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };

  const handleResizeStart = (
    event: React.PointerEvent<HTMLDivElement>,
    shapeId: string,
    direction: ResizeDirection
  ) => {
    event.stopPropagation();

    const shape = shapes.find(
      (shape) => shape.id === shapeId
    );

    if (!shape) return;

    selectShape(shapeId);

    resizingShapeId.current =
      shapeId;

    resizeDirection.current =
      direction;

    resizeStart.current = {
      x: event.clientX,
      y: event.clientY,
      width: shape.width,
      height: shape.height,
      shapeX: shape.x,
      shapeY: shape.y,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (
      resizingShapeId.current &&
      resizeDirection.current
    ) {
      const shapeId =
        resizingShapeId.current;

      const direction =
        resizeDirection.current;

      const start =
        resizeStart.current;

      const deltaX =
        event.clientX - start.x;

      const deltaY =
        event.clientY - start.y;

      const MIN_SIZE = 40;

      let newWidth = start.width;
      let newHeight = start.height;

      let newX = start.shapeX;
      let newY = start.shapeY;

      if (direction.includes("right")) {
        newWidth = Math.max(
          MIN_SIZE,
          start.width + deltaX
        );
      }

      if (direction.includes("left")) {
        newWidth = Math.max(
          MIN_SIZE,
          start.width - deltaX
        );

        newX =
          start.shapeX +
          (start.width - newWidth);
      }

      if (direction.includes("bottom")) {
        newHeight = Math.max(
          MIN_SIZE,
          start.height + deltaY
        );
      }

      if (direction.includes("top")) {
        newHeight = Math.max(
          MIN_SIZE,
          start.height - deltaY
        );

        newY =
          start.shapeY +
          (start.height - newHeight);
      }

      const shape = shapes.find(
        (shape) => shape.id === shapeId
      );

      if (!shape) return;

      const updatedShape: Shape = {
        ...shape,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };

      updateShape(
        shapeId,
        {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        },
        roomId
      );

      onUpdateShape(updatedShape);

      return;
    }

    if (!draggingShapeId.current) {
      return;
    }

    const shape = shapes.find(
      (shape) =>
        shape.id ===
        draggingShapeId.current
    );

    if (!shape) return;

    const newX =
      event.clientX -
      dragOffset.current.x;

    const newY =
      event.clientY -
      dragOffset.current.y;

    const updatedShape: Shape = {
      ...shape,
      x: newX,
      y: newY,
    };

    updateShape(
      shape.id,
      {
        x: newX,
        y: newY,
      },
      roomId
    );

    onUpdateShape(updatedShape);
  };

  const handlePointerUp = () => {
    draggingShapeId.current = null;

    resizingShapeId.current = null;

    resizeDirection.current = null;
  };

  return (
    <div
      className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-100"
      onClick={() => selectShape(null)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {shapes.map((shape) => {
        const isSelected =
          selectedShapeId === shape.id;

        return (
          <div
            key={shape.id}
            onPointerDown={(event) =>
              handlePointerDown(
                event,
                shape.id
              )
            }
            onClick={(event) => {
              event.stopPropagation();

              selectShape(shape.id);
            }}
            className={`absolute select-none ${
              shape.type === "circle"
                ? "rounded-full"
                : "rounded-md"
            } ${
              isSelected
                ? "ring-4 ring-blue-400"
                : ""
            }`}
            style={{
              left: shape.x,
              top: shape.y,
              width: shape.width,
              height: shape.height,
              backgroundColor:
                shape.color,
              cursor:
                draggingShapeId.current
                  ? "grabbing"
                  : "grab",
            }}
          >
            {isSelected && (
              <>
                <ResizeHandle
                  position="top-left"
                  onPointerDown={(event) =>
                    handleResizeStart(
                      event,
                      shape.id,
                      "top-left"
                    )
                  }
                />

                <ResizeHandle
                  position="top-right"
                  onPointerDown={(event) =>
                    handleResizeStart(
                      event,
                      shape.id,
                      "top-right"
                    )
                  }
                />

                <ResizeHandle
                  position="bottom-left"
                  onPointerDown={(event) =>
                    handleResizeStart(
                      event,
                      shape.id,
                      "bottom-left"
                    )
                  }
                />

                <ResizeHandle
                  position="bottom-right"
                  onPointerDown={(event) =>
                    handleResizeStart(
                      event,
                      shape.id,
                      "bottom-right"
                    )
                  }
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ResizeHandle = ({
  position,
  onPointerDown,
}: ResizeHandleProps) => {
  const positionClasses = {
    "top-left":
      "-left-2 -top-2 cursor-nwse-resize",

    "top-right":
      "-right-2 -top-2 cursor-nesw-resize",

    "bottom-left":
      "-bottom-2 -left-2 cursor-nesw-resize",

    "bottom-right":
      "-bottom-2 -right-2 cursor-nwse-resize",
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onClick={(event) =>
        event.stopPropagation()
      }
      className={`absolute h-4 w-4 rounded-full border-2 border-blue-500 bg-white ${positionClasses[position]}`}
    />
  );
};

export default Canvas;