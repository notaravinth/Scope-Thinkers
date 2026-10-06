import Dexie, {
  type Table,
} from "dexie";
import type { Shape } from "../types/whiteboard";

export interface StoredBoard {
  id: string;
  shapes: Shape[];
  updatedAt: number;
}

class WhiteboardDatabase extends Dexie {
  boards!: Table<StoredBoard, string>;

  constructor() {
    super("CollabBoardDatabase");

    this.version(1).stores({
      boards: "id, updatedAt",
    });
  }
}

export const db =
  new WhiteboardDatabase();