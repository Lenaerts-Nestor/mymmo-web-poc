"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { InboxHeader } from "@/app/components/inbox/inboxIntro";
import { InboxCard } from "@/app/components/inbox/inboxCard";

export default function InboxPage() {
  const { personId } = useParams();

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <DashboardLayout personId={personId as string} personName="">
        <InboxHeader />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <InboxCard />
          <InboxCard />
          <InboxCard />
        </div>
        <p>This is the inbox page for the dashboard.</p>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
