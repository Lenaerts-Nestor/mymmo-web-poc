// src/app/components/AppWrapper.tsx - Fixed: No API calls before login

"use client";
import { usePathname } from "next/navigation";
import { UserProvider } from "../contexts/UserContext";
import { SidebarProvider } from "../contexts/SidebarContext";
import { UnreadCounterProvider } from "../contexts/UnreadCounterContext";
import { QueryProvider } from "../providers/QueryProvider";
import Sidebar from "./Sidebar";
import { isDashboardRoute } from "../utils/route";

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <QueryProvider>
      <UserProvider>
        <SidebarProvider>
          <ConditionalUnreadCounterProvider>
            <AppContent>{children}</AppContent>
          </ConditionalUnreadCounterProvider>
        </SidebarProvider>
      </UserProvider>
    </QueryProvider>
  );
}

// New component to conditionally render UnreadCounterProvider
function ConditionalUnreadCounterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = isDashboardRoute(pathname);

  // Only provide UnreadCounterProvider on dashboard routes
  if (showSidebar) {
    return <UnreadCounterProvider>{children}</UnreadCounterProvider>;
  }

  // No UnreadCounterProvider on login/other pages
  return <>{children}</>;
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
