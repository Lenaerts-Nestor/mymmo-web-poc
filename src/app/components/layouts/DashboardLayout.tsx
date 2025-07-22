// src/app/components/layouts/DashboardLayout.tsx
"use client";

import React from "react";
import { SocketZoneProvider } from "../../contexts/socket/SocketZoneProvider";

export function DashboardLayout({
  children,
  personId,
}: {
  children: React.ReactNode;
  personId: string;
}) {
  return (
    <SocketZoneProvider>
      <div className="dashboard-layout">
        {/* Your existing layout components */}
        {children}
      </div>
    </SocketZoneProvider>
  );
}
