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

  return (
    <div className="flex justify-end w-full mb-4">
      <div className="bg-white/70 rounded-2xl shadow-lg p-3 mb-6 items-center flex relative">
        <input
          type="text"
          placeholder="Search zones..."
          className="w-64 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 pr-16"
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
        />

        {/* Clear button */}
        {searchItem && (
          <button
            onClick={clearSearch}
            className="absolute right-12 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        {/* Search icon */}
        <Search
          size={20}
          className="absolute right-4 text-gray-500 pointer-events-none"
        />
      </div>
    </div>
  );
}
