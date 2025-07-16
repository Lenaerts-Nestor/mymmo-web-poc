// src/app/components/Sidebar.tsx
"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarProps, NavItem } from "../types/ui/Sidebar";
import SessionService from "../services/sessionService";
import { SidebarHeader } from "./sidebar/sidebarHeader";
import { SidebarNavigation } from "./sidebar/sidebarNavigation";
import { SidebarFooter } from "./sidebar/sidebarFooter";
import { SidebarToggleButton } from "./sidebar/sidebarToggleButton";

export default function Sidebar({
  personId,
  personName,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // Clear session and OAuth cache
      await SessionService.logout();

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleToggleClick = () => {
    onToggleCollapse();
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`h-screen fixed left-0 top-0 flex flex-col border-r-2 backdrop-blur-sm transition-transform duration-300 ease-in-out z-40 sidebar-scroll ${
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{
          width: "var(--sidebar-width)",
          backgroundColor: "var(--sidebar-bg)",
          borderColor: "var(--sidebar-border)",
          boxShadow: "var(--sidebar-shadow)",
        }}
      >
        <SidebarHeader personName={personName} isCollapsed={isCollapsed} />

        <SidebarNavigation
          personId={personId}
          pathname={pathname}
          router={router}
        />
        <SidebarFooter
          isLoggingOut={isLoggingOut}
          handleLogout={handleLogout}
        />
      </div>

      {/* Toggle Button */}
      <SidebarToggleButton
        handleToggleClick={handleToggleClick}
        isCollapsed={isCollapsed}
      />

      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={handleToggleClick}
          aria-hidden="true"
        />
      )}
    </>
  );
}
