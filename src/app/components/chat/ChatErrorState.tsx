import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";

interface ChatErrorStateProps {
  error: any;
  onRetry: () => void;
}

export function ChatErrorState({ error, onRetry }: ChatErrorStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <ErrorDisplay error={error} onRetry={onRetry} />
    </div>
  );
}