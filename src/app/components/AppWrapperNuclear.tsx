// src/app/components/AppWrapperNuclear.tsx - NUCLEAR CLEANUP
"use client";

import { usePathname } from "next/navigation";
import { QueryProvider } from "../providers/QueryProvider";
import { UnifiedAppProvider } from "../contexts/UnifiedAppContext";
import Sidebar from "./Sidebar";
import { isDashboardRoute } from "../utils/route";

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <QueryProvider>
      <UnifiedAppProvider enableSocket={true}>
        <AppContent>{children}</AppContent>
      </UnifiedAppProvider>
    </QueryProvider>
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
      <main className={showSidebar ? "dashboard-main" : "p-8"}>{children}</main>
    </div>
  );
}
