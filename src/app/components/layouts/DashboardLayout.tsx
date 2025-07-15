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
      <Sidebar personId={personId} personName={personName} />
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
