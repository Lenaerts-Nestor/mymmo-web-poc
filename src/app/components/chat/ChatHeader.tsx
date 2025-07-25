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
    <div className="bg-gradient-to-r from-[var(--pure-white)] to-[var(--primary-offwhite)] border-b-2 border-[var(--gravel-100)] px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 hover:bg-[var(--primary-sunglow)]/20 rounded-xl transition-all duration-200 text-[var(--primary-wine)] hover:text-[var(--primary-wine)] shadow-sm border-2 border-[var(--gravel-100)] hover:border-[var(--primary-sunglow)] hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md bg-[var(--secondary-lightblue)]/30 border-2 border-[var(--secondary-lightblue)]">
              <MessageCircle className="w-6 h-6 text-[var(--primary-wine)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--primary-wine)] mb-1">
                Conversatie
              </h1>
              <div className="flex items-center gap-4 text-sm text-[var(--gravel-500)]">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-[var(--gravel-300)]" />{" "}
                  <span className="font-medium">
                    {messagesCount}{" "}
                    {messagesCount === 1 ? "bericht" : "berichten"}
                  </span>
                </div>
                {unreadCount > 0 && (
                  <Badge className="bg-[var(--error)] text-[var(--pure-white)] px-3 py-1 rounded-full font-bold shadow-md">
                    <Bell className="w-3 h-3 mr-1" />
                    {unreadCount} ongelezen
                  </Badge>
                )}
                <div className="flex items-center gap-2 bg-[var(--secondary-tea)]/20 px-3 py-1 rounded-full border border-[var(--secondary-tea)]">
                  <div className="w-2 h-2 bg-[var(--secondary-tea)] rounded-full animate-pulse shadow-sm"></div>
                  <span className="text-xs font-medium text-[var(--primary-wine)]">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
