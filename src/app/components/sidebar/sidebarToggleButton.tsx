import { ChevronRight, ChevronLeft } from "lucide-react";

export function SidebarToggleButton({
  handleToggleClick,
  isCollapsed,
}: {
  handleToggleClick: () => void;
  isCollapsed: boolean;
}) {
  return (
    <button
      onClick={handleToggleClick}
      className={`fixed top-6 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:shadow-xl z-50 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 ${
        isCollapsed ? "left-6 hover:scale-110" : "hover:scale-105"
      }`}
      style={{
        width: "var(--toggle-button-size)",
        height: "var(--toggle-button-size)",
        left: isCollapsed ? "24px" : "calc(var(--sidebar-width) - 6px)",
        backgroundColor: "var(--toggle-button-bg)",
        color: "var(--toggle-button-fg)",
        boxShadow: "var(--toggle-button-shadow)",
      }}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!isCollapsed}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--toggle-button-fg)";
        e.currentTarget.style.color = "var(--toggle-button-bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--toggle-button-bg)";
        e.currentTarget.style.color = "var(--toggle-button-fg)";
      }}
    >
      {isCollapsed ? (
        <ChevronRight size={20} className="ml-0.5" />
      ) : (
        <ChevronLeft size={20} className="mr-0.5" />
      )}
    </button>
  );
}
