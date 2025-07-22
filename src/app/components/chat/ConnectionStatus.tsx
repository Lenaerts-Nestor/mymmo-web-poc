// src/app/components/chat/ConnectionStatus.tsx - SPLIT COMPONENT

interface ConnectionStatusProps {
  isConnected: boolean;
  socketStatus: string;
  participantCount: number;
  messagesCount: number;
}

export function ConnectionStatus({
  isConnected,
  socketStatus,
  participantCount,
  messagesCount,
}: ConnectionStatusProps) {
  return (
    <div className="px-4 py-2 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">{participantCount} deelnemers</span>

          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Live chat</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600">Offline mode</span>
              </>
            )}
          </div>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-400">
            Socket: {socketStatus} | Messages: {messagesCount}
          </div>
        )}
      </div>
    </div>
  );
}
