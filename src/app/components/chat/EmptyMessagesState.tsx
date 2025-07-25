"use client";

import { MessageCircle, Wifi, WifiOff } from "lucide-react";

interface EmptyMessagesStateProps {
  isConnected: boolean;
}

export function EmptyMessagesState({ isConnected }: EmptyMessagesStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-16">
      <div className="w-20 h-20 rounded-full bg-[#b0c2fc]/20 flex items-center justify-center mb-6 shadow-lg border-2 border-[#b0c2fc]">
        <MessageCircle className="w-10 h-10 text-[#552e38]" />{" "}
      </div>
      <h3 className="text-2xl font-bold text-[#552e38] mb-3">
        Nog geen berichten
      </h3>
      <p className="text-lg text-[#765860] mb-6 max-w-md leading-relaxed">
        Dit is het begin van jullie conversatie. Stuur het eerste bericht om de
        discussie te starten!
      </p>
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isConnected
            ? "bg-[#aced94]/20 text-[#552e38] border-2 border-[#aced94]"
            : "bg-[#ffb5b5]/20 text-[#b00205] border-2 border-[#b00205]"
        }`}
      >
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Verbonden - berichten worden live bijgewerkt</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>Offline - verbinding wordt hersteld...</span>
          </>
        )}
      </div>
    </div>
  );
}
