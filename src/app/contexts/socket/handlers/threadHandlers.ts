export function setupThreadUpdateHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  threadUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>
) {
  const handleThreadUpdate = (data: any) => {
    threadUpdateCallbacks.current.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in thread update callback:", error);
      }
    });
  };

  socket.on("update_thread_screen", handleThreadUpdate);
  socket.on("thread_list_updated", handleThreadUpdate);

  return () => {
    socket.off("update_thread_screen", handleThreadUpdate);
    socket.off("thread_list_updated", handleThreadUpdate);
  };
}