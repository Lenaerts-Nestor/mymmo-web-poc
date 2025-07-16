// src/app/components/AppWrapper.tsx
"use client";
import { usePathname } from "next/navigation";
import { UserProvider } from "../contexts/UserContext";
import { SidebarProvider } from "../contexts/SidebarContext";
import Sidebar from "./Sidebar";
import { isDashboardRoute } from "../utils/route";

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <UserProvider>
      <SidebarProvider>
        <AppContent>{children}</AppContent>
      </SidebarProvider>
    </UserProvider>
  );
}

function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = isDashboardRoute(pathname);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--primary-cream)" }}
    >
      {showSidebar && <Sidebar />}
      <main
        className={`transition-all duration-300 ease-in-out ${
          showSidebar ? "dashboard-main" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
