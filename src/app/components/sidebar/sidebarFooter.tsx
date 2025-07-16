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
        className="logout-button"
      >
        <LogOut size={20} />
        <span>{isLoggingOut ? "Uitloggen..." : "Uitloggen"}</span>
      </button>
    </div>
  );
}
