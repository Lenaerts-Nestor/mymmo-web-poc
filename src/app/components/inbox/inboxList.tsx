// src/app/components/inbox/InboxList.tsx - Enhanced Brand Styling

import { InboxData } from "@/app/types/inbox";
import { InboxCard } from "./inboxCard";

interface InboxListProps {
  inboxData: InboxData;
  isLoading: boolean;
  onItemClick: (zoneId: number, threadId: string) => void;
}

function InboxListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-[20px] shadow-sm border-2 border-[#CFC4C7] p-8 animate-pulse"
        >
          {/* Zone Header skeleton */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="h-6 bg-[#F5F2DE] rounded-[10px] w-48 mb-3"></div>
              <div className="h-4 bg-[#CFC4C7] rounded-[8px] w-64"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-6 bg-[#FACF59] rounded-full w-12"></div>
              <div className="h-4 bg-[#CFC4C7] rounded-[8px] w-16"></div>
            </div>
          </div>

          {/* Message Content skeleton */}
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-[#B0C2FC] rounded-full flex-shrink-0 border-2 border-[#FACF59]"></div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-4 bg-[#CFC4C7] rounded-[8px] w-32"></div>
                <div className="h-4 bg-[#A69298] rounded-[8px] w-16"></div>
              </div>
              <div className="h-4 bg-[#F5F2DE] rounded-[8px] w-full mb-2"></div>
              <div className="h-4 bg-[#F5F2DE] rounded-[8px] w-3/4"></div>
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="flex justify-between items-center pt-4 border-t border-[#CFC4C7]">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#ACED94] rounded-full"></div>
              <div className="h-3 bg-[#A69298] rounded-[6px] w-24"></div>
            </div>
            <div className="h-3 bg-[#A69298] rounded-[6px] w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyInboxState() {
  return (
    <div className="text-center py-20 bg-white rounded-[20px] border-2 border-[#CFC4C7] shadow-sm">
      <div className="text-8xl mb-8">📬</div>
      <h2 className="text-3xl font-bold mb-4 text-[#552E38]">Inbox is leeg</h2>
      <p className="text-lg text-[#A69298] mb-3 font-medium">
        Geen ongelezen berichten gevonden.
      </p>
      <p className="text-sm text-[#765860]">
        Nieuwe berichten verschijnen hier automatisch.
      </p>

      {/* Optional: Add a subtle action suggestion */}
      <div className="mt-8 inline-flex items-center space-x-2 bg-[#F5F2DE] px-4 py-2 rounded-[15px]">
        <div className="w-2 h-2 bg-[#ACED94] rounded-full animate-pulse"></div>
        <span className="text-sm text-[#552E38] font-medium">
          Wachten op nieuwe berichten...
        </span>
      </div>
    </div>
  );
}

export function InboxList({
  inboxData,
  isLoading,
  onItemClick,
}: InboxListProps) {
  if (isLoading) {
    return <InboxListSkeleton />;
  }

  if (!inboxData.items || inboxData.items.length === 0) {
    return <EmptyInboxState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {inboxData.items.map((item) => (
        <InboxCard
          key={`${item.zoneId}-${item.thread._id}`}
          item={item}
          onClick={onItemClick}
        />
      ))}
    </div>
  );
}
