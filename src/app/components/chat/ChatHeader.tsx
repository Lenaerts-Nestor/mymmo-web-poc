// src/app/components/chat/ChatHeader.tsx

import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  personId: string;
  zoneId: string;
  threadId: string;
  messagesCount: number;
  unreadCount: number;
  onBack: () => void;
  onMarkAsRead: () => void;
}

export function ChatHeader({
  personId,
  zoneId,
  threadId,
  messagesCount,
  unreadCount,
  onBack,
  onMarkAsRead,
}: ChatHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-800 px-6 py-4 rounded-t-xl ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-stone-800">Conversatie</h1>
            <div className="flex items-center gap-4 text-sm text-stone-600">
              <span>
                {messagesCount} bericht{messagesCount === 1 ? "" : "en"}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {unreadCount} ongelezen
                </span>
              )}
              {/* Development polling indicator */}
              {process.env.NODE_ENV === "development" && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  ⚡ Real-time (5s)
                </span>
              )}
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Markeer als gelezen
          </button>
        )}
      </div>
    </div>
  );
}
