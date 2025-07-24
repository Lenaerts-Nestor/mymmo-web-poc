"use client";

import type { SidebarFooterProps } from "@/app/types/ui/Sidebar";
import { LogOut } from "lucide-react";

export function SidebarFooter({
  isLoggingOut,
  handleLogout,
}: SidebarFooterProps) {
  return (
    <div className="p-4 border-t border-[#cfc4c7]">
      {" "}
      {/* gravel-100 */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium
                   bg-[#f5f2de] text-[#552e38] hover:bg-[#552e38] hover:text-[#f5f2de]
                   hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#facf59] focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {" "}
        {/* primary-offwhite, primary-wine, primary-sunglow */}
        <LogOut size={20} />
        <span>{isLoggingOut ? "Uitloggen..." : "Uitloggen"}</span>
      </button>
    </div>
  );
}
