// src/app/components/AppWrapper.tsx - Enhanced with Socket Provider Integration
"use client";

import { usePathname } from "next/navigation";
import { UserProvider, useUser } from "../contexts/UserContext";
import { QueryProvider } from "../providers/QueryProvider";
import { SocketProvider } from "../contexts/SocketContext";
import { ZonesProvider } from "../contexts/ZonesContext";
import Sidebar from "./Sidebar";
import { isDashboardRoute } from "../utils/routes";

interface AppWrapperProps {
  children: React.ReactNode;
}

function SocketIntegration({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  const personId = user?.personId
    ? parseInt(user.personId.toString())
    : undefined;

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
      <ZonesProvider>{children}</ZonesProvider>
    </SocketProvider>
  );
}

export function AppWrapper({ children }: AppWrapperProps) {
  return (
    <QueryProvider>
      <UserProvider>
        <SocketIntegration>
          <AppContent>{children}</AppContent>
        </SocketIntegration>
      </UserProvider>
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
