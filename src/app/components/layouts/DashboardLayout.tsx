// src/app/components/layouts/DashboardLayout.tsx
"use client";
import Sidebar from "@/app/components/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  personId: string;
}

export function DashboardLayout({ children, personId }: DashboardLayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--primary-cream)" }}
    >
      <Sidebar />

      <div className="h-screen mx-auto">{children}</div>
    </div>
  );
}
