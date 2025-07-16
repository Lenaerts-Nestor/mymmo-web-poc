import { SidebarHeaderProps } from "@/app/types/ui/Sidebar";

export function SidebarHeader({ personName, isCollapsed }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <h1
        className={`text-xl font-bold transition-all duration-300 ${
          isCollapsed ? "opacity-0" : "opacity-100"
        }`}
      >
        {personName}
      </h1>
    </div>
  );
}
