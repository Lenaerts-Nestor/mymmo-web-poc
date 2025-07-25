// src/app/components/layouts/DashboardLayout.tsx
"use client";
import Sidebar from "@/app/components/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  personId: string;
}

export function DashboardLayout({ children, personId }: DashboardLayoutProps) {
  return (
    <div style={{ background: "var(--primary-cream)" }}>
      <Sidebar />

      <div>{children}</div>
    </div>
  );
}
