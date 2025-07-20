// src/app/components/AppWrapper.tsx - Enhanced with Socket Provider Integration
"use client";

import { usePathname } from "next/navigation";
import { UserProvider, useUser } from "../contexts/UserContext";
import { SidebarProvider } from "../contexts/SidebarContext";
import { UnreadCounterProvider } from "../contexts/UnreadCounterContext";
import { QueryProvider } from "../providers/QueryProvider";
import { SocketProvider } from "../contexts/SocketContext"; // 🆕 NEW: Socket provider
import Sidebar from "./Sidebar";
import { isDashboardRoute } from "../utils/route";

interface AppWrapperProps {
  children: React.ReactNode;
}

// 🆕 NEW: Socket integration component that has access to user context
function SocketIntegration({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  // Extract personId from user session (adjust based on your SessionData structure)
  const personId = user?.personId
    ? parseInt(user.personId.toString())
    : undefined;

  // Only enable socket when user is authenticated and not loading
  const socketEnabled = !isLoading && !!personId;

  if (process.env.NODE_ENV === "development") {
    console.log("🔌 Socket Integration:", {
      userLoading: isLoading,
      personId,
      socketEnabled,
      user: user ? "Authenticated" : "Not authenticated",
    });
  }

  return (
    <SocketProvider personId={personId} enabled={socketEnabled}>
      {children}
    </SocketProvider>
  );
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <QueryProvider>
      <UserProvider>
        <SocketIntegration>
          <SidebarProvider>
            <ConditionalUnreadCounterProvider>
              <AppContent>{children}</AppContent>
            </ConditionalUnreadCounterProvider>
          </SidebarProvider>
        </SocketIntegration>
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
