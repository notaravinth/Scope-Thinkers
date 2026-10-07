import { useRef } from "react";

import {
  RotateCw,
} from "lucide-react";

import { useWhiteboardStore } from "../store/whiteboardStore";

import type { Shape } from "../types/whiteboard";

type ResizeDirection =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface CanvasProps {
  roomId: string;
  onUpdateShape: (
    shape: Shape
  ) => void;
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
  const shapes =
    useWhiteboardStore(
      (state) => state.shapes
    );

  const selectedShapeId =
    useWhiteboardStore(
      (state) =>
        state.selectedShapeId
    );

  const selectShape =
    useWhiteboardStore(
      (state) => state.selectShape
    );

  const updateShape =
    useWhiteboardStore(
      (state) => state.updateShape
    );

  const draggingShapeId =
    useRef<string | null>(
      null
    );

  const dragOffset =
    useRef({
      x: 0,
      y: 0,
    });

  const resizingShapeId =
    useRef<string | null>(
      null
    );

  const resizeDirection =
    useRef<
      ResizeDirection | null
    >(null);

  const resizeStart =
    useRef({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      shapeX: 0,
      shapeY: 0,
    });

  const rotatingShapeId =
    useRef<string | null>(
      null
    );

  const rotationStart =
    useRef({
      centerX: 0,
      centerY: 0,
      startAngle: 0,
      initialRotation: 0,
    });

  const getRotation =
    (shape: Shape) =>
      shape.rotation ?? 0;

  const updateShapeAndSync = (
    shape: Shape,
    updates: Partial<Shape>
  ) => {
    const updatedShape: Shape =
      {
        ...shape,
        ...updates,
      };

    updateShape(
      shape.id,
      updates,
      roomId
    );

    onUpdateShape(
      updatedShape
    );
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    shapeId: string
  ) => {
    event.stopPropagation();

    const shape =
      shapes.find(
        (shape) =>
          shape.id === shapeId
      );

    if (!shape) return;

    selectShape(shapeId);

    draggingShapeId.current =
      shapeId;

    dragOffset.current = {
      x:
        event.clientX -
        shape.x,
      y:
        event.clientY -
        shape.y,
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

    const shape =
      shapes.find(
        (shape) =>
          shape.id === shapeId
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

  const handleRotateStart = (
    event: React.PointerEvent<HTMLDivElement>,
    shapeId: string
  ) => {
    event.stopPropagation();

    const shape =
      shapes.find(
        (shape) =>
          shape.id === shapeId
      );

    if (!shape) return;

    selectShape(shapeId);

    rotatingShapeId.current =
      shapeId;

    const centerX =
      shape.x +
      shape.width / 2;

    const centerY =
      shape.y +
      shape.height / 2;

    const startAngle =
      Math.atan2(
        event.clientY -
          centerY,
        event.clientX -
          centerX
      ) *
      (180 / Math.PI);

    rotationStart.current = {
      centerX,
      centerY,
      startAngle,
      initialRotation:
        getRotation(shape),
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };

  const handleTextEdit = (
    event: React.MouseEvent<HTMLDivElement>,
    shape: Shape
  ) => {
    event.stopPropagation();

    if (
      shape.type !== "text"
    ) {
      return;
    }

    const newText =
      window.prompt(
        "Edit text:",
        shape.text ?? ""
      );

    if (
      newText === null ||
      newText === shape.text
    ) {
      return;
    }

    updateShapeAndSync(
      shape,
      {
        text: newText,
      }
    );
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    /*
     * ROTATION
     */
    if (
      rotatingShapeId.current
    ) {
      const shape =
        shapes.find(
          (shape) =>
            shape.id ===
            rotatingShapeId.current
        );

      if (!shape) return;

      const rotationStartData =
        rotationStart.current;

      const currentAngle =
        Math.atan2(
          event.clientY -
            rotationStartData.centerY,
          event.clientX -
            rotationStartData.centerX
        ) *
        (180 / Math.PI);

      let newRotation =
        rotationStartData.initialRotation +
        (currentAngle -
          rotationStartData.startAngle);

      /*
       * Keep rotation between
       * 0 and 360 degrees.
       */
      newRotation =
        ((newRotation %
          360) +
          360) %
        360;

      updateShapeAndSync(
        shape,
        {
          rotation:
            newRotation,
        }
      );

      return;
    }

    /*
     * RESIZE
     */
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
        event.clientX -
        start.x;

      const deltaY =
        event.clientY -
        start.y;

      const MIN_SIZE = 40;

      let newWidth =
        start.width;

      let newHeight =
        start.height;

      let newX =
        start.shapeX;

      let newY =
        start.shapeY;

      if (
        direction.includes(
          "right"
        )
      ) {
        newWidth =
          Math.max(
            MIN_SIZE,
            start.width +
              deltaX
          );
      }

      if (
        direction.includes(
          "left"
        )
      ) {
        newWidth =
          Math.max(
            MIN_SIZE,
            start.width -
              deltaX
          );

        newX =
          start.shapeX +
          (start.width -
            newWidth);
      }

      if (
        direction.includes(
          "bottom"
        )
      ) {
        newHeight =
          Math.max(
            MIN_SIZE,
            start.height +
              deltaY
          );
      }

      if (
        direction.includes(
          "top"
        )
      ) {
        newHeight =
          Math.max(
            MIN_SIZE,
            start.height -
              deltaY
          );

        newY =
          start.shapeY +
          (start.height -
            newHeight);
      }

      const shape =
        shapes.find(
          (shape) =>
            shape.id ===
            shapeId
        );

      if (!shape) return;

      updateShapeAndSync(
        shape,
        {
          x: newX,
          y: newY,
          width: newWidth,
          height:
            newHeight,
        }
      );

      return;
    }

    /*
     * DRAGGING
     */
    if (
      !draggingShapeId.current
    ) {
      return;
    }

    const shape =
      shapes.find(
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

    updateShapeAndSync(
      shape,
      {
        x: newX,
        y: newY,
      }
    );
  };

  const handlePointerUp = () => {
    draggingShapeId.current =
      null;

    resizingShapeId.current =
      null;

    resizeDirection.current =
      null;

    rotatingShapeId.current =
      null;
  };

  return (
    <div
      className="relative min-w-0 flex-1 overflow-hidden bg-gray-100"
      onClick={() =>
        selectShape(null)
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerUp={
        handlePointerUp
      }
    >
      {shapes.map(
        (shape) => {
          const isSelected =
            selectedShapeId ===
            shape.id;

          const isLine =
            shape.type ===
            "line";

          const isArrow =
            shape.type ===
            "arrow";

          const isText =
            shape.type ===
            "text";

          const rotation =
            getRotation(shape);

          return (
            <div
              key={shape.id}
              onPointerDown={(
                event
              ) =>
                handlePointerDown(
                  event,
                  shape.id
                )
              }
              onClick={(
                event
              ) => {
                event.stopPropagation();

                selectShape(
                  shape.id
                );
              }}
              onDoubleClick={(
                event
              ) =>
                handleTextEdit(
                  event,
                  shape
                )
              }
              className={`absolute select-none ${
                shape.type ===
                "circle"
                  ? "rounded-full"
                  : shape.type ===
                    "rectangle"
                  ? "rounded-md"
                  : ""
              } ${
                isSelected
                  ? "ring-4 ring-blue-400"
                  : ""
              }`}
              style={{
                left: shape.x,
                top: shape.y,
                width:
                  shape.width,
                height:
                  isLine ||
                  isArrow
                    ? 12
                    : shape.height,
                zIndex:
                  shape.zIndex ??
                  0,
                backgroundColor:
                  isLine ||
                  isArrow ||
                  isText
                    ? "transparent"
                    : shape.color,
                transform: `rotate(${rotation}deg)`,
                transformOrigin:
                  "center center",
                cursor:
                  draggingShapeId.current
                    ? "grabbing"
                    : "grab",
              }}
            >
              {isLine && (
                <svg
                  className="pointer-events-none absolute left-0 top-0 overflow-visible"
                  width={
                    shape.width
                  }
                  height="12"
                >
                  <line
                    x1="0"
                    y1="6"
                    x2={
                      shape.width
                    }
                    y2="6"
                    stroke={
                      shape.color
                    }
                    strokeWidth="3"
                  />
                </svg>
              )}

              {isArrow && (
                <svg
                  className="pointer-events-none absolute left-0 top-0 overflow-visible"
                  width={
                    shape.width
                  }
                  height="12"
                >
                  <defs>
                    <marker
                      id={`arrow-${shape.id}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="8"
                      refY="5"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path
                        d="M 0 0 L 10 5 L 0 10 z"
                        fill={
                          shape.color
                        }
                      />
                    </marker>
                  </defs>

                  <line
                    x1="0"
                    y1="6"
                    x2={
                      shape.width
                    }
                    y2="6"
                    stroke={
                      shape.color
                    }
                    strokeWidth="3"
                    markerEnd={`url(#arrow-${shape.id})`}
                  />
                </svg>
              )}

              {isText && (
                <div
                  className="whitespace-nowrap text-xl font-medium"
                  style={{
                    color:
                      shape.color,
                  }}
                >
                  {shape.text}
                </div>
              )}

              {isSelected && (
                <>
                  <ResizeHandle
                    position="top-left"
                    onPointerDown={(
                      event
                    ) =>
                      handleResizeStart(
                        event,
                        shape.id,
                        "top-left"
                      )
                    }
                  />

                  <ResizeHandle
                    position="top-right"
                    onPointerDown={(
                      event
                    ) =>
                      handleResizeStart(
                        event,
                        shape.id,
                        "top-right"
                      )
                    }
                  />

                  <ResizeHandle
                    position="bottom-left"
                    onPointerDown={(
                      event
                    ) =>
                      handleResizeStart(
                        event,
                        shape.id,
                        "bottom-left"
                      )
                    }
                  />

                  <ResizeHandle
                    position="bottom-right"
                    onPointerDown={(
                      event
                    ) =>
                      handleResizeStart(
                        event,
                        shape.id,
                        "bottom-right"
                      )
                    }
                  />

                  <RotateHandle
                    onPointerDown={(
                      event
                    ) =>
                      handleRotateStart(
                        event,
                        shape.id
                      )
                    }
                  />
                </>
              )}
            </div>
          );
        }
      )}
    </div>
  );
};

const ResizeHandle = ({
  position,
  onPointerDown,
}: ResizeHandleProps) => {
  const positionClasses =
    {
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
      onPointerDown={
        onPointerDown
      }
      onClick={(event) =>
        event.stopPropagation()
      }
      className={`absolute z-20 h-4 w-4 rounded-full border-2 border-blue-500 bg-white ${positionClasses[position]}`}
    />
  );
};

interface RotateHandleProps {
  onPointerDown: (
    event: React.PointerEvent<HTMLDivElement>
  ) => void;
}

const RotateHandle = ({
  onPointerDown,
}: RotateHandleProps) => {
  return (
    <div
      onPointerDown={
        onPointerDown
      }
      onClick={(event) =>
        event.stopPropagation()
      }
      className="absolute left-1/2 top-0 z-20 flex h-6 w-6 -translate-x-1/2 -translate-y-9 cursor-grab items-center justify-center rounded-full border-2 border-blue-500 bg-white text-blue-500 shadow-sm active:cursor-grabbing"
    >
      <RotateCw
        size={14}
      />
    </div>
  );
};

export default Canvas;