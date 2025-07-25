"use client";

import { ArrowLeft, MessageCircle, Users, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  personId: string;
  zoneId: string;
  threadId: string;
  messagesCount: number;
  unreadCount: number;
  onBack: () => void;
}

export function ChatHeader({
  personId,
  zoneId,
  threadId,
  messagesCount,
  unreadCount,
  onBack,
}: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#ffffff] to-[#f5f2de] border-b-2 border-[#cfc4c7] px-6 py-4 shadow-sm">
      {" "}
      {/* pure-white to primary-offwhite, gravel-100 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 hover:bg-[#facf59]/20 rounded-xl transition-all duration-200 text-[#552e38] hover:text-[#552e38] shadow-sm border-2 border-[#cfc4c7] hover:border-[#facf59] hover:scale-105"
          >
            {" "}
            {/* primary-sunglow/20, primary-wine, gravel-100, primary-sunglow */}
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-[#b0c2fc]/30 border-2 border-[#b0c2fc]">
              {" "}
              {/* secondary-lightblue/30, secondary-lightblue */}
              <MessageCircle className="w-6 h-6 text-[#552e38]" />{" "}
              {/* primary-wine */}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#552e38] mb-1">
                Conversatie
              </h1>{" "}
              {/* primary-wine */}
              <div className="flex items-center gap-4 text-sm text-[#765860]">
                {" "}
                {/* gravel-500 */}
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-[#a69298]" />{" "}
                  {/* gravel-300 */}
                  <span className="font-medium">
                    {messagesCount}{" "}
                    {messagesCount === 1 ? "bericht" : "berichten"}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-[#b00205] text-[#ffffff] px-3 py-1 rounded-full font-bold shadow-md">
                    {" "}
                    {/* error color */}
                    <Bell className="w-3 h-3 mr-1" />
                    {unreadCount} ongelezen
                  </Badge>
                )}
                <div className="flex items-center gap-2 bg-[#aced94]/20 px-3 py-1 rounded-full border border-[#aced94]">
                  {" "}
                  {/* secondary-tea/20, secondary-tea */}
                  <div className="w-2 h-2 bg-[#aced94] rounded-full animate-pulse shadow-sm"></div>{" "}
                  {/* secondary-tea */}
                  <span className="text-xs font-medium text-[#552e38]">
                    Live
                  </span>{" "}
                  {/* primary-wine */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
