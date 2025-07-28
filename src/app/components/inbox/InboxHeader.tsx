"use client";

interface InboxHeaderProps {
  totalUnread: number;
}

export function InboxHeader({ totalUnread }: InboxHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[#552e38]">Inbox</h1>
          {totalUnread > 0 && (
            <span className="bg-[#b00205] text-white text-sm px-3 py-1 rounded-full font-bold">
              {totalUnread}
            </span>
          )}
        </div>
        <div className="text-sm text-[#765860]">
          {totalUnread} ongelezen berichten uit alle zones
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live updates
        </div>
      </div>
      <div className="text-sm text-[#765860] mt-2">
        Laatste update: 0 seconden geleden
      </div>
    </div>
  );
}