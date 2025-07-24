"use client";

import { useState } from "react";

interface ZonesToggleProps {
  showAllZones: boolean;
  onToggleChange: (showAll: boolean) => void;
}

export function ZonesToggle({
  showAllZones,
  onToggleChange,
}: ZonesToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggleChange(!showAllZones);

    // Reset animation after a brief delay
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-4 w-75">
      <div className="flex items-center space-x-3">
        {/* Toggle switch */}
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            showAllZones ? "bg-blue-600" : "bg-gray-400"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out shadow-sm ${
              showAllZones ? "translate-x-7" : "translate-x-1"
            } ${isAnimating ? "scale-105" : ""}`}
          />
        </button>

        {/* Toggle state text */}
        <span className="text-sm font-medium text-gray-600">
          {showAllZones ? "ON" : "OFF"}
        </span>

        {/* Main label */}
        <span className="text-sm font-medium text-gray-700">
          Alle zones met berichten
        </span>
      </div>
    </div>
  );
}
