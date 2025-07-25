export const shouldShowTime = (
  currentMessage: any,
  previousMessage: any
): boolean => {
  if (!previousMessage) return true;

  const currentTime = new Date(currentMessage.created_on).getTime();
  const previousTime = new Date(previousMessage.created_on).getTime();
  const timeDifference = currentTime - previousTime;

  // Show time if more than 5 minutes apart or different sender
  return (
    timeDifference > 5 * 60 * 1000 ||
    currentMessage.created_by !== previousMessage.created_by
  );
};

export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (messageDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }
};
