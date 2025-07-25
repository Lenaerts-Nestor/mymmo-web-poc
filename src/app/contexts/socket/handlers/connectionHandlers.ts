import { SocketStatus } from "../../../types/socket";
import { joinSocketRoom } from "../socketUtils";

export function setupConnectionHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  personId: number,
  currentRooms: React.MutableRefObject<Set<string>>,
  setStatus: React.Dispatch<React.SetStateAction<SocketStatus>>,
  setLastError: React.Dispatch<React.SetStateAction<string | null>>,
  reconnectAttempts: React.MutableRefObject<number>,
  maxReconnectAttempts: number = 5
) {
  socket.on("connect", () => {
    setStatus("connected");
    setLastError(null);
    reconnectAttempts.current = 0;

    // Auto-join person room
    joinSocketRoom(socket, personId.toString(), personId);

    // Rejoin all rooms
    currentRooms.current.forEach((roomId) => {
      joinSocketRoom(socket, roomId, personId);
    });
  });

  socket.on("disconnect", (reason: string) => {
    setStatus("disconnected");

    if (reason === "io server disconnect") {
      setLastError("Server disconnected");
    } else {
      setStatus("reconnecting");
    }
  });

  socket.on("connect_error", (error: Error) => {
    console.error("Socket connection error:", error.message);
    setStatus("error");
    setLastError(error.message);
    reconnectAttempts.current++;

    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setLastError("Unable to connect after multiple attempts");
    }
  });

  socket.on("reconnect", (attemptNumber: number) => {
    setStatus("connected");
    setLastError(null);
    reconnectAttempts.current = 0;
  });
}