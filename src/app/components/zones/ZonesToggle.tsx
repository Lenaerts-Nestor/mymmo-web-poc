"use client";

import { ToggleSwitch } from "@/app/components/ui/ToggleSwitch";

interface ZonesToggleProps {
  showAllZones: boolean;
  onToggleChange: (showAll: boolean) => void;
}

export function ZonesToggle({
  showAllZones,
  onToggleChange,
}: ZonesToggleProps) {
  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-4 w-75">
      <ToggleSwitch
        checked={showAllZones}
        onCheckedChange={onToggleChange}
        label={showAllZones ? "ON" : "OFF"}
        description="Alle zones met berichten"
      />
    </div>
  );
}
