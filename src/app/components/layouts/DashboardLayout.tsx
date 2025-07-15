import Sidebar from "@/app/components/Sidebar";
import { DashboardLayoutProps } from "@/app/types/dashboard";

export function DashboardLayout({
  children,
  personId,
  personName,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <Sidebar personId={personId} personName={personName} />
      <main className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
