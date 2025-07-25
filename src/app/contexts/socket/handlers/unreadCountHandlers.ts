export function setupUnreadCountHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  unreadCountCallbacks: React.MutableRefObject<Set<(data: any) => void>>,
  zoneRequestMap: React.MutableRefObject<Map<string, string>> = {
    current: new Map(),
  },
  currentPersonId?: number
) {
  const handleUnreadCountUpdate = (data: any) => {
    // Extract zone information from stored request map or data
    if (data.threadsData) {
      const threads = data.threadsData;

      // Try to get zone_id from the data or map it from stored requests
      let zoneId = threads[0]?.zone_id || threads[0]?.zoneId;

      // If no zone_id in thread data, try to infer from stored context
      if (!zoneId && data.zoneId) {
        zoneId = data.zoneId;
      }

      // Add zone_id to each thread if missing
      const threadsWithZone = threads.map((thread: any) => ({
        ...thread,
        zone_id: zoneId || thread.zone_id || thread.zoneId,
        zoneId: zoneId || thread.zone_id || thread.zoneId,
      }));

      // Update the data with zone information
      const enrichedData = {
        ...data,
        threadsData: threadsWithZone,
        zoneId: zoneId,
      };

      unreadCountCallbacks.current.forEach((callback) => {
        try {
          callback(enrichedData);
        } catch (error) {
          console.error("Error in unread count callback:", error);
        }
      });

      return;
    }

    // Forward other data as-is
    unreadCountCallbacks.current.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in unread count callback:", error);
      }
    });
  };

  // Listen to the existing thread events that affect unread counts
  socket.on("update_groups", handleUnreadCountUpdate);
  socket.on("thread_list_updated", handleUnreadCountUpdate);

  // Also listen to message events that affect unread counts
  const handleNewMessageForInbox = (data: any) => {
    // Only update unread counts if it's not our own message
    const isOwnMessage = currentPersonId && data.created_by === currentPersonId;
    
    if (!isOwnMessage) {
      // Convert and forward as unread count update with zone info
      handleUnreadCountUpdate({
        type: "new_message",
        thread_id: data.thread_id,
        zone_id: data.zone_id, // Include zone_id from message data
        message: data,
      });
    }
  };

  socket.on("receive_thread_message", handleNewMessageForInbox);
  socket.on("thread_message_broadcasted", handleNewMessageForInbox);

  return () => {
    socket.off("update_groups", handleUnreadCountUpdate);
    socket.off("thread_list_updated", handleUnreadCountUpdate);
    socket.off("receive_thread_message", handleNewMessageForInbox);
    socket.off("thread_message_broadcasted", handleNewMessageForInbox);
  };
}
