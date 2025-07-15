"use client";
import Sidebar from "@/app/components/Sidebar";
import { DashboardLayoutProps } from "@/app/types/dashboard";
import { useResponsiveSidebar } from "@/app/hooks/useResponsiveSidebar";

export function DashboardLayout({
  children,
  personId,
  personName,
}: DashboardLayoutProps) {
  const { isCollapsed, toggleCollapse } = useResponsiveSidebar();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--primary-cream)" }}
    >
      <Sidebar
        personId={personId}
        personName={personName}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <main
        className="p-8 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isCollapsed ? "0" : "var(--sidebar-width)",
        }}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
