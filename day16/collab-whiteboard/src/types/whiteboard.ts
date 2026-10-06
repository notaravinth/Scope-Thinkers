export type ShapeType = "rectangle" | "circle";

export interface Shape {
  id: string;
  type: ShapeType;

  x: number;
  y: number;

  width: number;
  height: number;

  color: string;
}