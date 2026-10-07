import type { Shape } from "./whiteboard";

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