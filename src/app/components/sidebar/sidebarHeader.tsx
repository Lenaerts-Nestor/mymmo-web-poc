"use client";

import { User } from "lucide-react";

export function SidebarHeader() {
  const handleProfileClick = () => {
    // TODO: Implement profile functionality later
    alert("Profile functionality will be implemented later");
  };

  return (
    <div className="flex items-center justify-center p-4 border-b border-[#cfc4c7]">
      {" "}
      {/* gravel-100 */}
      <button
        onClick={handleProfileClick}
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                   bg-[#f5f2de] text-[#552e38] hover:bg-[#552e38] hover:text-[#f5f2de]
                   hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#facf59] focus:ring-offset-2"
      >
        {" "}
        {/* primary-offwhite, primary-wine, primary-sunglow */}
        <User size={20} />
        <span className="font-semibold">Profile</span>
      </button>
    </div>
  );
}
