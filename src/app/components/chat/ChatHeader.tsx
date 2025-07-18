// src/app/components/chat/ChatHeader.tsx - Clean & Minimalist Mymmo Design

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
    <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 text-gray-600 hover:text-gray-900 shadow-sm border border-gray-200 hover:border-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Chat icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md text-white font-semibold text-sm"
              style={{
                background: "linear-gradient(135deg, #e4dece 0%, #d4c4a8 100%)",
              }}
            >
              <span style={{ color: "#6b4e3d" }}>💬</span>
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Conversatie</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="font-medium">
                  {messagesCount}{" "}
                  {messagesCount === 1 ? "bericht" : "berichten"}
                </span>

                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md">
                    {unreadCount} ongelezen
                  </span>
                )}

                {/* Live indicator */}
                <div className="flex items-center gap-1.5 bg-green-100 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-xs font-medium text-green-700">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAsRead}
            className="px-4 py-2.5 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #b8b3e6 0%, #a8a0d9 100%)",
            }}
          >
            Markeer als gelezen
          </button>
        )}
      </div>
    </div>
  );
}
