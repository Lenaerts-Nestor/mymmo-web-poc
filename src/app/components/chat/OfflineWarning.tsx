// src/app/components/chat/OfflineWarning.tsx - SPLIT COMPONENT

interface OfflineWarningProps {
  isConnected: boolean;
}

export function OfflineWarning({ isConnected }: OfflineWarningProps) {
  if (isConnected) return null;

  return (
    <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-2">
      <div className="flex items-center text-yellow-800 text-sm">
        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
        <span>
          Real-time verbinding niet beschikbaar. Berichten worden via standaard
          API verzonden.
        </span>
      </div>
    </div>
  );
}
