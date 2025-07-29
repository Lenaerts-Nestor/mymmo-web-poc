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
        </div>
        <div className="text-sm text-[#765860]">
          {totalUnread} ongelezen berichten uit alle zones
        </div>
      </div>
    </div>
  );
}
