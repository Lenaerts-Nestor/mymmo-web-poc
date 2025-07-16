import { SidebarFooterProps } from "@/app/types/ui/Sidebar";
import { LogOut } from "lucide-react";

export function SidebarFooter({
  isLoggingOut,
  handleLogout,
}: SidebarFooterProps) {
  return (
    <div className="p-4 border-t-2 border-purple-200/30">
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold ${
          isLoggingOut
            ? "cursor-not-allowed opacity-50"
            : "hover:shadow-md hover:scale-[1.01]"
        }`}
        style={{
          color: "#542e39",
          backgroundColor: "#E4DECE",
        }}
        onMouseEnter={(e) => {
          if (!isLoggingOut) {
            e.currentTarget.style.backgroundColor = "#542e39";
            e.currentTarget.style.color = "#E4DECE";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoggingOut) {
            e.currentTarget.style.backgroundColor = "#E4DECE";
            e.currentTarget.style.color = "#542e39";
          }
        }}
      >
        <LogOut size={20} />
        <span className="font-semibold">
          {isLoggingOut ? "Uitloggen..." : "Uitloggen"}
        </span>
      </button>
    </div>
  );
}
