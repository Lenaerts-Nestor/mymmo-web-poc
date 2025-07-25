import { RealtimeMessage } from "../../../types/socket";

export function setupMessageHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  messageCallbacks: React.MutableRefObject<
    Set<(message: RealtimeMessage) => void>
  >
) {
  const handleRealtimeMessage = (data: any) => {
    const message: RealtimeMessage = {
      _id: data._id || `temp-${crypto.randomUUID()}`,
      text: data.text || "",
      created_on: data.created_on || new Date().toISOString(),
      created_by: data.created_by || 0,
      thread_id: data.thread_id || "",
      attachments: data.attachments || [],
      isOptimistic: false,
      zone_id: data.zone_id, // Include zone_id for proper routing
    };

    messageCallbacks.current.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("Error in message callback:", error);
      }
    });
  };

  socket.on("receive_thread_message", handleRealtimeMessage);
  socket.on("thread_message_broadcasted", handleRealtimeMessage);
  socket.on("update_thread_screen", handleRealtimeMessage);

  return () => {
    socket.off("receive_thread_message", handleRealtimeMessage);
    socket.off("thread_message_broadcasted", handleRealtimeMessage);
    socket.off("update_thread_screen", handleRealtimeMessage);
  };
}