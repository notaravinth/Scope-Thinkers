import { WebSocketServer, WebSocket } from "ws";

const PORT = 8080;

const server = new WebSocketServer({
  port: PORT,
});

type Room = Set<WebSocket>;

interface Shape {
  id: string;

  type: "rectangle" | "circle" | "line" | "arrow" | "text";

  x: number;
  y: number;

  width: number;
  height: number;

  color: string;

  text?: string;

  zIndex?: number;
}

const rooms = new Map<string, Room>();

const roomShapes = new Map<string, Map<string, Shape>>();

type ClientMessage =
  | {
      type: "JOIN_ROOM";
      roomId: string;
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

const broadcastToRoom = (
  roomId: string,
  message: object,
  sender?: WebSocket,
) => {
  const room = rooms.get(roomId);

  if (!room) return;

  const messageString = JSON.stringify(message);

  room.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
};

server.on("connection", (socket) => {
  console.log("Client connected");

  let currentRoomId: string | null = null;

  socket.on("message", (data) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      if (message.type === "JOIN_ROOM") {
        const roomId = message.roomId;

        currentRoomId = roomId;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }

        if (!roomShapes.has(roomId)) {
          roomShapes.set(roomId, new Map());
        }

        rooms.get(roomId)!.add(socket);

        console.log(`Client joined room: ${roomId}`);

        const shapes = Array.from(roomShapes.get(roomId)!.values());

        socket.send(
          JSON.stringify({
            type: "ROOM_STATE",
            roomId,
            shapes,
          }),
        );

        socket.send(
          JSON.stringify({
            type: "ROOM_JOINED",
            roomId,
          }),
        );

        return;
      }

      if (message.type === "ADD_SHAPE") {
        if (!roomShapes.has(message.roomId)) {
          roomShapes.set(message.roomId, new Map());
        }

        roomShapes.get(message.roomId)!.set(message.shape.id, message.shape);

        broadcastToRoom(message.roomId, message, socket);

        return;
      }

      if (message.type === "UPDATE_SHAPE") {
        if (!roomShapes.has(message.roomId)) {
          roomShapes.set(message.roomId, new Map());
        }

        roomShapes.get(message.roomId)!.set(message.shape.id, message.shape);

        broadcastToRoom(message.roomId, message, socket);

        return;
      }

      if (message.type === "DELETE_SHAPE") {
        const shapes = roomShapes.get(message.roomId);

        shapes?.delete(message.shapeId);

        broadcastToRoom(message.roomId, message, socket);

        return;
      }
    } catch (error) {
      console.error("Invalid WebSocket message:", error);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");

    if (!currentRoomId) {
      return;
    }

    const room = rooms.get(currentRoomId);

    if (!room) return;

    room.delete(socket);

    if (room.size === 0) {
      rooms.delete(currentRoomId);

      console.log(`No connected clients in room: ${currentRoomId}`);
    }
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
