import { useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { attachClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";

function TaskCard({
  task,
  onDeleteTask,
}) {
  const cardRef = useRef(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isOver, setIsOver] =
    useState(false);

  useEffect(() => {
    const element = cardRef.current;

    if (!element) return;

    const cleanupDraggable = draggable({
      element,

      getInitialData() {
        return {
          type: "task",
          taskId: task.id,
          projectId: task.projectId,
          status: task.status,
        };
      },

      onDragStart() {
        setIsDragging(true);
      },

      onDrop() {
        setIsDragging(false);
      },
    });

    const cleanupDropTarget =
      dropTargetForElements({
        element,

        canDrop({ source }) {
          return (
            source.data?.type === "task" &&
            source.data?.taskId !== task.id
          );
        },

        getData({ input }) {
          return attachClosestEdge(
            {
              type: "task",
              taskId: task.id,
              status: task.status,
            },
            {
              element,
              input,
              allowedEdges: ["top", "bottom"],
            }
          );
        },

        onDragEnter() {
          setIsOver(true);
        },

        onDragLeave() {
          setIsOver(false);
        },

        onDrop() {
          setIsOver(false);
        },
      });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
    };
  }, [task]);

  function handleDeleteClick(event) {
    event.stopPropagation();

    onDeleteTask(task.id);
  }

  const priority =
    task.priority?.toLowerCase();

  const priorityStyles = {
    low: "bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400",
    medium:
      "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
    high: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
  };

  const priorityClass =
    priorityStyles[priority] ||
    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";

  return (
    <div
      ref={cardRef}
      className={`
        w-full
        min-w-0
        max-w-full
        overflow-hidden
        rounded-xl
        border
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-150
        dark:bg-gray-900

        ${
          isDragging
            ? "scale-[0.98] cursor-grabbing border-gray-400 opacity-50 dark:border-gray-600"
            : "cursor-grab border-gray-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:hover:border-gray-700"
        }

        ${
          isOver
            ? "border-gray-400 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
            : ""
        }
      `}
    >
      <div className="flex min-w-0 flex-wrap items-start gap-2">
        <h3 className="min-w-0 flex-1 break-words text-sm font-semibold leading-5 text-gray-900 dark:text-white">
          {task.title}
        </h3>

        <div className="flex shrink-0 items-center gap-1.5">
          {task.priority && (
            <span
              className={`
                shrink-0
                whitespace-nowrap
                rounded-full
                px-2.5
                py-1
                text-[11px]
                font-medium
                leading-none
                ${priorityClass}
              `}
            >
              {task.priority}
            </span>
          )}

          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:text-gray-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            title="Delete task"
          >
            ×
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-3 break-words text-xs leading-5 text-gray-500 dark:text-gray-400">
          {task.description}
        </p>
      )}

      {(task.description ||
        task.assignedTo) && (
        <div className="my-3 h-px bg-gray-100 dark:bg-gray-800" />
      )}

      {task.assignedTo && (
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {task.assignedTo
              ?.charAt(0)
              .toUpperCase() || "U"}
          </div>

          <span className="min-w-0 truncate text-xs text-gray-400 dark:text-gray-500">
            Assigned
          </span>
        </div>
      )}
    </div>
  );
}

export default TaskCard;