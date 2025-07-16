"use client";
import Sidebar from "@/app/components/Sidebar";
import { DashboardLayoutProps } from "@/app/types/dashboard";

export function DashboardLayout({
  children,
  personId,
  personName,
}: DashboardLayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--primary-cream)" }}
    >
      <Sidebar />

      <main
        className="p-8 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: "var(--sidebar-width)",
        }}
      >
        <div className="max-w-9/10 mx-auto">{children}</div>
      </main>
    </div>
  );
}
