"use client";

import { WifiOff, AlertTriangle } from "lucide-react";

interface OfflineWarningProps {
  isConnected: boolean;
}

export function OfflineWarning({ isConnected }: OfflineWarningProps) {
  if (isConnected) return null;

  return (
    <div className="bg-gradient-to-r from-[var(--secondary-melon)]/20 to-[var(--secondary-melon)]/10 border-t-2 border-[var(--error)] px-6 py-3">
      <div className="flex items-center justify-center gap-3 text-[var(--error)]">
        <div className="flex items-center gap-2">
          <WifiOff className="w-5 h-5 animate-pulse" />
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold">Verbinding verbroken</p>
          <p className="text-xs text-[var(--gravel-500)]">
            Berichten worden mogelijk niet direct verzonden. Verbinding wordt
            automatisch hersteld.
          </p>
        </div>
      </div>
    </div>
  );
}
