import { create } from "zustand";
import type { Shape } from "../types/whiteboard";
import { saveBoard } from "../db/boardStorage";

interface WhiteboardState {
  shapes: Shape[];
  selectedShapeId: string | null;

  addShape: (
    shape: Shape,
    roomId: string
  ) => void;

  updateShape: (
    id: string,
    updates: Partial<Shape>,
    roomId: string
  ) => void;

  deleteShape: (
    id: string,
    roomId: string
  ) => void;

  setShapes: (shapes: Shape[]) => void;

  setShape: (shape: Shape) => void;

  selectShape: (
    id: string | null
  ) => void;
}

export const useWhiteboardStore =
  create<WhiteboardState>((set, get) => ({
    shapes: [],

    selectedShapeId: null,

    addShape: (shape, roomId) => {
      const newShapes = [
        ...get().shapes,
        shape,
      ];

      set({
        shapes: newShapes,
      });

      void saveBoard(
        roomId,
        newShapes
      );
    },

    updateShape: (
      id,
      updates,
      roomId
    ) => {
      const newShapes =
        get().shapes.map(
          (shape) =>
            shape.id === id
              ? {
                  ...shape,
                  ...updates,
                }
              : shape
        );

      set({
        shapes: newShapes,
      });

      void saveBoard(
        roomId,
        newShapes
      );
    },

    deleteShape: (
      id,
      roomId
    ) => {
      const newShapes =
        get().shapes.filter(
          (shape) =>
            shape.id !== id
        );

      set({
        shapes: newShapes,
        selectedShapeId:
          get().selectedShapeId === id
            ? null
            : get().selectedShapeId,
      });

      void saveBoard(
        roomId,
        newShapes
      );
    },

    setShapes: (shapes) =>
      set({
        shapes,
      }),

    setShape: (shape) =>
      set((state) => {
        const exists =
          state.shapes.some(
            (currentShape) =>
              currentShape.id ===
              shape.id
          );

        if (!exists) {
          return {
            shapes: [
              ...state.shapes,
              shape,
            ],
          };
        }

        return {
          shapes:
            state.shapes.map(
              (currentShape) =>
                currentShape.id ===
                shape.id
                  ? shape
                  : currentShape
            ),
        };
      }),

    selectShape: (id) =>
      set({
        selectedShapeId: id,
      }),
  }));