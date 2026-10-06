import { db } from "./whiteboardDB";
import type { Shape } from "../types/whiteboard";

export const saveBoard = async (
  roomId: string,
  shapes: Shape[]
) => {
  await db.boards.put({
    id: roomId,
    shapes,
    updatedAt: Date.now(),
  });
};

export const loadBoard = async (
  roomId: string
): Promise<Shape[]> => {
  const board =
    await db.boards.get(roomId);

  return board?.shapes ?? [];
};

export const deleteBoard = async (
  roomId: string
) => {
  await db.boards.delete(roomId);
};