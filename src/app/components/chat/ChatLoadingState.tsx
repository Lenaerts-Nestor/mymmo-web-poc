import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

interface ChatLoadingStateProps {
  isConnected: boolean;
}

export function ChatLoadingState({ isConnected }: ChatLoadingStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Berichten laden...</p>
        {isConnected && (
          <div className="mt-2 text-green-600 text-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Real-time verbinding actief
          </div>
        )}
      </div>
    </div>
  );
}