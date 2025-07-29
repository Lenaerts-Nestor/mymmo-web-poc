import React from "react";
import { ToggleSwitch } from "@/app/components/ui/ToggleSwitch";

interface ConversationsToggleProps {
  showAllThreads: boolean;
  onToggleChange: (showAll: boolean) => void;
}

export function ConversationsToggle({
  showAllThreads,
  onToggleChange,
}: ConversationsToggleProps) {
  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-4 w-full max-w-xl">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">
          Conversatie weergave:
        </span>
        <ToggleSwitch
          checked={showAllThreads}
          onCheckedChange={onToggleChange}
          label={
            showAllThreads
              ? "🫡 Alle conversaties"
              : "💬 Alleen ongelezen conversaties"
          }
        />
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {showAllThreads
          ? "Alle conversaties worden getoond"
          : "Alleen conversaties met ongelezen berichten worden getoond"}
      </div>
    </div>
  );
}
