import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export async function createTask({
  projectId,
  title,
  description,
  priority,
  assignedTo,
  createdBy,
}) {
  const task = {
    projectId,
    title: title.trim(),
    description: description.trim(),
    status: "todo",
    priority,
    assignedTo:
      assignedTo || null,
    createdBy,
    position: Date.now(),
    createdAt:
      serverTimestamp(),
    updatedAt:
      serverTimestamp(),
  };

  const taskRef =
    await addDoc(
      collection(
        db,
        "tasks"
      ),
      task
    );

  return taskRef.id;
}

export async function updateTaskStatus(
  taskId,
  status,
  position
) {
  const taskRef = doc(
    db,
    "tasks",
    taskId
  );

  await updateDoc(
    taskRef,
    {
      status,
      position,
      updatedAt:
        serverTimestamp(),
    }
  );
}

export async function updateTaskPositions(
  updates
) {
  const updatePromises =
    updates.map(
      ({
        taskId,
        status,
        position,
      }) => {
        const taskRef =
          doc(
            db,
            "tasks",
            taskId
          );

        return updateDoc(
          taskRef,
          {
            status,
            position,
            updatedAt:
              serverTimestamp(),
          }
        );
      }
    );

  await Promise.all(
    updatePromises
  );
}