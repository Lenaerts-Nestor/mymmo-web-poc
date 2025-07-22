// src/app/components/chat/EmptyMessagesState.tsx - SPLIT COMPONENT

interface EmptyMessagesStateProps {
  isConnected: boolean;
}

export function EmptyMessagesState({ isConnected }: EmptyMessagesStateProps) {
  return (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <div className="text-6xl mb-4">💬</div>
        <p className="text-xl font-medium mb-2">Geen berichten</p>
        <p className="text-sm">Start een gesprek door een bericht te typen</p>
        {isConnected && (
          <p className="text-xs text-green-600 mt-2">
            ✨ Real-time chat is actief
          </p>
        )}
      </div>
    </div>
  );
}
