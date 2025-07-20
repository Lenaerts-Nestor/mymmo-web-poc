// src/app/components/ui/ErrorDisplay.tsx - Error Display Component

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-red-800 mb-2">
          Er is een fout opgetreden
        </h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Opnieuw proberen
          </button>
        )}
      </div>
    </div>
  );
}
