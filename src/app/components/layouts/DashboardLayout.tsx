// src/app/components/layouts/DashboardLayout.tsx - REMOVED OLD PROVIDERS
"use client";

import React from "react";

export function DashboardLayout({
  children,
  personId,
}: {
  children: React.ReactNode;
  personId: string;
}) {
  // Remove SocketZoneProvider - it's already in UnifiedAppContext
  return <div className="dashboard-layout">{children}</div>;
}
