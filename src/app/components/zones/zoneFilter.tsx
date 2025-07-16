"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ZoneFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("searchZone") || "";
  const [searchItem, setSearchItem] = useState(initialSearch);

  const updateSearch = (newSearch: string) => {
    setSearchItem(newSearch);
    const params = new URLSearchParams(searchParams.toString());
    params.set("searchZone", newSearch);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex justify-end w-full mb-4">
      <div className="bg-white/70 rounded-2xl shadow-lg p-3 mb-6 items-center flex">
        <input
          type="text"
          placeholder="Search zones..."
          className="w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:--foreground"
          value={searchItem}
          onChange={(e) => updateSearch(e.target.value)}
        />
        <Search
          size={25}
          className="inline-block ml-2 text-gray-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
