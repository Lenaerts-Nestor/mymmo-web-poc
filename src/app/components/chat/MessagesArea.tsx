import { MessageBubble } from "./MessageBubble";
import { shouldShowTime } from "./chatUtils";
import { EmptyMessagesState } from "./EmptyMessagesState";

interface MessagesAreaProps {
  messages: any[];
  personId: string;
  isConnected: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  getUserInfo: (createdBy: number) => {
    firstName?: string;
    lastName?: string;
    profilePic?: string | null;
  };
}

export function MessagesArea({
  messages,
  personId,
  isConnected,
  messagesEndRef,
  getUserInfo,
}: MessagesAreaProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <EmptyMessagesState isConnected={isConnected} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const showTime = shouldShowTime(message, previousMessage);
        const userInfo = getUserInfo(message.created_by);

        return (
          <MessageBubble
            key={message._id}
            message={message}
            currentPersonId={parseInt(personId)}
            showTime={showTime}
            senderInfo={userInfo}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}