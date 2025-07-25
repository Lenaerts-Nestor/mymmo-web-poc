import React from "react";

interface ConversationsHeaderProps {
  personId: string;
  zoneId: string;
  translationLang: string;
  threadsCount: number;
  highlightThreadId: string | null;
  onBackToZones: () => void;
  isActivePage: boolean;
  zoneName?: string; // 🆕 Optional, fallback to zoneId if not provided
}

export function ConversationsHeader({
  personId,
  zoneId,
  translationLang,
  threadsCount,
  highlightThreadId,
  onBackToZones,
  isActivePage,
  zoneName,
}: ConversationsHeaderProps) {
  // If zoneName is not provided, fallback to zoneId
  const displayZone = zoneName || zoneId;
  return (
    <div className="bg-white/70 rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-2">
        {/* Back button left */}
        <div className="flex-shrink-0 flex justify-start w-1/4">
          <button
            onClick={onBackToZones}
            className="px-4 py-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors border border-gray-200 shadow-sm"
            type="button"
          >
            &larr; Terug naar zones
          </button>
        </div>
        {/* Title center */}
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-1 text-center">
            Conversaties van{" "}
            <span className="text-blue-700">{displayZone}</span>
          </h1>
          {highlightThreadId && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mt-1">
              Nieuw bericht gemarkeerd
            </span>
          )}
        </div>
        {/* Thread count right */}
        <div className="flex-shrink-0 flex justify-end w-1/4">
          <span className="text-sm text-stone-600">
            {threadsCount} Conversatie{threadsCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
