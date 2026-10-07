export type ShapeType =
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text";

export interface Shape {
  id: string;
  type: ShapeType;

  x: number;
  y: number;

  width: number;
  height: number;

  color: string;

  text?: string;

  zIndex?: number;

  rotation?: number;
}