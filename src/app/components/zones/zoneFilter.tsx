// src/app/components/zones/zoneFilter.tsx - Improved Design

"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

interface ZoneFilterProps {
  onSearchChange: (search: string) => void;
  initialSearch?: string;
}

export function ZoneFilter({
  onSearchChange,
  initialSearch = "",
}: ZoneFilterProps) {
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
    <div className="bg-white/70 rounded-2xl shadow-lg backdrop-blur-sm p-4">
      <div className="relative">
        <div
          className={`relative flex items-center bg-white rounded-xl border-2 transition-all duration-200 ${
            isFocused
              ? "border-blue-500 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          {/* Search icon */}
          <Search
            size={20}
            className={`absolute left-3 transition-colors duration-200 ${
              isFocused ? "text-blue-500" : "text-gray-400"
            }`}
          />

          {/* Input field */}
          <input
            type="text"
            placeholder="Search zones..."
            className="w-full pl-10 pr-10 py-3 bg-transparent border-none rounded-xl focus:outline-none text-gray-700 placeholder-gray-400"
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Clear button */}
          {searchItem && (
            <button
              onClick={clearSearch}
              className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
