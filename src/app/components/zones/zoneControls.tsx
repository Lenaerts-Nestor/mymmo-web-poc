"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

// Simple Switch component
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

function Switch({ checked, onCheckedChange, className = "" }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${checked ? "bg-blue-600" : "bg-gray-200"}
        ${className}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}

interface ZoneControlsProps {
  onSearchChange: (search: string) => void;
  showAllZones: boolean;
  onToggleChange: (showAll: boolean) => void;
  initialSearch?: string;
}

export function ZoneControls({
  onSearchChange,
  showAllZones,
  onToggleChange,
  initialSearch = "",
}: ZoneControlsProps) {
  const [searchItem, setSearchItem] = useState(initialSearch);
  const [isFocused, setIsFocused] = useState(false);

  // Debounce search to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchItem);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchItem, onSearchChange]);

  const clearSearch = () => {
    setSearchItem("");
    onSearchChange("");
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Toggle Section */}
        <div className="flex-1">
          <div className="bg-white/80 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-[var(--primary-wine)] mb-1">
                  Zone weergave
                </h3>
                <p className="text-sm text-[var(--gravel-500)]">
                  {showAllZones
                    ? "Alle zones worden getoond"
                    : "Alleen zones met ongelezen berichten"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${
                    !showAllZones
                      ? "text-[var(--primary-wine)]"
                      : "text-[var(--gravel-300)]"
                  }`}
                >
                  Ongelezen
                </span>
                <Switch
                  checked={showAllZones}
                  onCheckedChange={onToggleChange}
                />
                <span
                  className={`text-sm font-medium ${
                    showAllZones
                      ? "text-[var(--primary-wine)]"
                      : "text-[var(--gravel-300)]"
                  }`}
                >
                  Alle
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="lg:w-80">
          <div className="relative">
            <div
              className={`relative flex items-center bg-white rounded-xl border-2 transition-all duration-200 ${
                isFocused
                  ? "border-[var(--secondary-lightblue)] shadow-md"
                  : "border-[var(--gravel-100)] hover:border-[var(--gravel-300)]"
              }`}
            >
              {/* Search icon */}
              <Search
                size={20}
                className={`absolute left-3 transition-colors duration-200 ${
                  isFocused
                    ? "text-[var(--secondary-lightblue)]"
                    : "text-[var(--gravel-300)]"
                }`}
              />

              {/* Input field */}
              <input
                type="text"
                placeholder="Zoek zones..."
                className="w-full pl-10 pr-10 py-3 bg-transparent border-none rounded-xl focus:outline-none text-[var(--primary-wine)] placeholder-[var(--gravel-300)]"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />

              {/* Clear button */}
              {searchItem && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 p-1 text-[var(--gravel-300)] hover:text-[var(--gravel-500)] transition-colors duration-200 hover:bg-[var(--gravel-100)] rounded-full"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
