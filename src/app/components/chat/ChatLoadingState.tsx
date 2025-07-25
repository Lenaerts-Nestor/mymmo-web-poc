"use client";

import { MessageCircle, Loader2 } from "lucide-react";

interface ChatLoadingStateProps {
  isConnected: boolean;
}

export function ChatLoadingState({ isConnected }: ChatLoadingStateProps) {
  return (
    <div className="flex flex-col h-[90vh] bg-gradient-to-br from-[var(--primary-offwhite)] to-[var(--pure-white)] rounded-2xl shadow-lg overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full bg-[var(--secondary-lightblue)]/20 flex items-center justify-center mb-6 shadow-lg border-2 border-[var(--secondary-lightblue)]">
          <MessageCircle className="w-10 h-10 text-[var(--primary-wine)]" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-6 h-6 text-[var(--secondary-lightblue)] animate-spin" />
          <h3 className="text-xl font-bold text-[var(--primary-wine)]">
            Conversatie laden...
          </h3>
        </div>

        <p className="text-[var(--gravel-500)] text-center max-w-md">
          Even geduld terwijl we je berichten ophalen.
        </p>

        <div
          className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isConnected
              ? "bg-[var(--secondary-tea)]/20 text-[var(--primary-wine)] border-2 border-[var(--secondary-tea)]"
              : "bg-[var(--secondary-melon)]/20 text-[var(--error)] border-2 border-[var(--error)]"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-[var(--secondary-tea)]" : "bg-[var(--error)]"
            } animate-pulse`}
          ></div>
          <span>{isConnected ? "Verbonden" : "Verbinding maken..."}</span>
        </div>
      </div>
    </div>
  );
}
