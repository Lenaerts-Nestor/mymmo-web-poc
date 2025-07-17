// src/app/components/zones/ZonesToggle.tsx

"use client";

import { useState, useEffect } from "react";

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
    <div className="bg-white/70 rounded-2xl shadow-lg p-4 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">
          Zone weergave:
        </span>

        <div className="flex items-center space-x-2">
          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showAllZones ? "bg-blue-600" : "bg-gray-400"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                showAllZones ? "translate-x-6" : "translate-x-1"
              } ${isAnimating ? "scale-110" : ""}`}
            />
          </button>

          {/* Labels */}
          <div className="flex items-center space-x-3">
            <span
              className={`text-sm ${
                !showAllZones ? "font-semibold text-gray-900" : "text-gray-500"
              }`}
            >
              📬 Alleen met ongelezen berichten
            </span>
            <span className="text-gray-300">|</span>
            <span
              className={`text-sm ${
                showAllZones ? "font-semibold text-gray-900" : "text-gray-500"
              }`}
            >
              📋 Toon alle zones
            </span>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-2 text-xs text-gray-500">
        {showAllZones
          ? "Alle zones worden getoond"
          : "Alleen zones met ongelezen conversaties worden getoond"}
      </div>
    </div>
  );
}
