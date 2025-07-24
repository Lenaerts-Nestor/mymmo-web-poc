// src/app/components/Sidebar.tsx
"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { SidebarHeader } from "./sidebar/sidebarHeader";
import { SidebarNavigation } from "./sidebar/sidebarNavigation";
import { SidebarFooter } from "./sidebar/sidebarFooter";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't render sidebar if no user session
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`h-screen fixed left-0 top-0 flex flex-col border-r-2 backdrop-blur-sm transition-transform duration-300 ease-in-out z-40 sidebar-scroll `}
        style={{
          width: "var(--sidebar-width)",
          backgroundColor: "var(--sidebar-bg)",
          borderColor: "var(--sidebar-border)",
          boxShadow: "var(--sidebar-shadow)",
        }}
      >
        <SidebarHeader />

        <SidebarNavigation
          personId={user.personId}
          pathname={pathname}
          router={router}
        />

        <SidebarFooter
          isLoggingOut={isLoggingOut}
          handleLogout={handleLogout}
        />
      </div>
    </>
  );
}
