"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ChatErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ChatErrorState({ error, onRetry }: ChatErrorStateProps) {
  return (
    <div className="flex flex-col h-[90vh] bg-gradient-to-br from-[#f5f2de] to-[#ffffff] rounded-2xl shadow-lg overflow-hidden">
      {" "}
      {/* primary-offwhite to pure-white */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full bg-[#ffb5b5]/20 flex items-center justify-center mb-6 shadow-lg border-2 border-[#b00205]">
          {" "}
          {/* secondary-melon/20, error color */}
          <AlertTriangle className="w-10 h-10 text-[#b00205]" />{" "}
          {/* error color */}
        </div>
        <h3 className="text-xl font-bold text-[#552e38] mb-3">
          Er is iets misgegaan
        </h3>{" "}
        {/* primary-wine */}
        <p className="text-[#765860] text-center max-w-md mb-6">
          {" "}
          {/* gravel-500 */}
          {error || "We konden de conversatie niet laden. Probeer het opnieuw."}
        </p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-[#b0c2fc] text-[#552e38] rounded-xl font-medium hover:bg-[#b0c2fc]/80 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
        >
          {" "}
          {/* secondary-lightblue, primary-wine */}
          <RefreshCw className="w-4 h-4" />
          Opnieuw proberen
        </button>
      </div>
    </div>
  );
}
