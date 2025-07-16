// src/app/components/sidebar/sidebarHeader.tsx
import { User } from "lucide-react";

export function SidebarHeader() {
  const handleProfileClick = () => {
    // TODO: Implement profile functionality later
    alert("Profile functionality will be implemented later");
  };

  return (
    <div className="flex items-center justify-center p-4">
      <button
        onClick={handleProfileClick}
        className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium hover:shadow-md hover:scale-[1.02]"
        style={{
          backgroundColor: "#E4DECE",
          color: "#542e39",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#542e39";
          e.currentTarget.style.color = "#E4DECE";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#E4DECE";
          e.currentTarget.style.color = "#542e39";
        }}
      >
        <User size={20} />
        <span className="font-semibold">Profile</span>
      </button>
    </div>
  );
}
