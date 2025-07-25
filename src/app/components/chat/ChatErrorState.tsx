"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ChatErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ChatErrorState({ error, onRetry }: ChatErrorStateProps) {
  return (
    <div className="flex flex-col h-[90vh] bg-gradient-to-br from-[var(--primary-offwhite)] to-[var(--pure-white)] rounded-2xl shadow-lg overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full bg-[var(--secondary-melon)]/20 flex items-center justify-center mb-6 shadow-lg border-2 border-[var(--error)]">
          <AlertTriangle className="w-10 h-10 text-[var(--error)]" />{" "}
        </div>
        <h3 className="text-xl font-bold text-[var(--primary-wine)] mb-3">
          Er is iets misgegaan
        </h3>{" "}
        <p className="text-[var(--gravel-500)] text-center max-w-md mb-6">
          {error || "We konden de conversatie niet laden. Probeer het opnieuw."}
        </p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--secondary-lightblue)] text-[var(--primary-wine)] rounded-xl font-medium hover:bg-[var(--secondary-lightblue)]/80 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
        >
          <RefreshCw className="w-4 h-4" />
          Opnieuw proberen
        </button>
      </div>
    </div>
  );
}
