"use client";

import { MessageCircle, Loader2 } from "lucide-react";

interface ChatLoadingStateProps {
  isConnected: boolean;
}

export function ChatLoadingState({ isConnected }: ChatLoadingStateProps) {
  return (
    <div className="flex flex-col h-[90vh] bg-gradient-to-br from-[#f5f2de] to-[#ffffff] rounded-2xl shadow-lg overflow-hidden">
      {" "}
      {/* primary-offwhite to pure-white */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 rounded-full bg-[#b0c2fc]/20 flex items-center justify-center mb-6 shadow-lg border-2 border-[#b0c2fc]">
          {" "}
          {/* secondary-lightblue/20, secondary-lightblue */}
          <MessageCircle className="w-10 h-10 text-[#552e38]" />{" "}
          {/* primary-wine */}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-6 h-6 text-[#b0c2fc] animate-spin" />{" "}
          {/* secondary-lightblue */}
          <h3 className="text-xl font-bold text-[#552e38]">
            Conversatie laden...
          </h3>{" "}
          {/* primary-wine */}
        </div>

        <p className="text-[#765860] text-center max-w-md">
          {" "}
          {/* gravel-500 */}
          Even geduld terwijl we je berichten ophalen.
        </p>

        {/* Connection status */}
        <div
          className={`mt-6 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isConnected
              ? "bg-[#aced94]/20 text-[#552e38] border-2 border-[#aced94]" // secondary-tea/20, primary-wine, secondary-tea
              : "bg-[#ffb5b5]/20 text-[#b00205] border-2 border-[#b00205]" // secondary-melon/20, error color
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-[#aced94]" : "bg-[#b00205]"
            } animate-pulse`}
          ></div>
          <span>{isConnected ? "Verbonden" : "Verbinding maken..."}</span>
        </div>
      </div>
    </div>
  );
}
