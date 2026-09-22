import { useEffect, useRef, useState } from "react";
import {
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import TaskCard from "./TaskCard";

function TaskColumn({
  column,
  tasks,
  onDeleteTask,
}) {
  const columnRef = useRef(null);

  const [isOver, setIsOver] =
    useState(false);

  useEffect(() => {
    const element = columnRef.current;

    if (!element) return;

    const cleanup =
      dropTargetForElements({
        element,

        canDrop({ source }) {
          return source.data?.type === "task";
        },

        getData() {
          return {
            type: "column",
            columnId: column.id,
          };
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

    return cleanup;
  }, [column.id]);

  return (
    <div
      ref={columnRef}
      className={`
        min-h-[200px]
        rounded-xl
        transition-colors

        ${
          isOver
            ? "bg-gray-200/70 dark:bg-gray-800/70"
            : ""
        }
      `}
    >
      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div
            className={`
              flex
              min-h-[120px]
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              transition-colors

              ${
                isOver
                  ? "border-gray-400 bg-white dark:border-gray-600 dark:bg-gray-900"
                  : "border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
              }
            `}
          >
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {isOver
                ? "Drop task here"
                : "No tasks"}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDeleteTask={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskColumn;