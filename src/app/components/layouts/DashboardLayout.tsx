"use client";
import { DashboardLayoutProps } from "@/app/types/dashboard";

export function DashboardLayout({
  children,
  personId,
  personName,
}: DashboardLayoutProps) {
  return <div className="max-w-7xl mx-auto">{children}</div>;
}
