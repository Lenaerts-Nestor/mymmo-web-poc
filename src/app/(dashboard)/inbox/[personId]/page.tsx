"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { InboxHeader } from "@/app/components/inbox/inboxIntro";
import { InboxCard } from "@/app/components/inbox/inboxCard";

export default function InboxPage() {
  const { personId } = useParams();

  const inboxData = [
    {
      department: "Support Team",
      subtitle: "General support inquiries",
      senderInitials: "AS",
      senderName: "Alice Smith",
      messagePreview: "Hi, I have a question about my order.",
      messageCount: 2,
      date: "15 jul",
    },
    {
      department: "Sales Department",
      subtitle: "New product inquiries",
      senderInitials: "BJ",
      senderName: "Bob Johnson",
      messagePreview: "Thanks for your interest in our new service!",
      messageCount: 1,
      date: "14 jul",
    },
    {
      department: "Feedback Channel",
      subtitle: "Share your thoughts and suggestions",
      senderInitials: "S",
      senderName: "sender3",
      messagePreview: "I love the new feature!",
      messageCount: 1,
      date: "13 jul",
    },
  ];

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <DashboardLayout personId={personId as string} personName="">
        <div className="max-w-7xl mx-auto px-4">
          <InboxHeader />

          <div className="grid grid-cols-3 gap-6 mb-8">
            {inboxData.map((item, index) => (
              <InboxCard
                key={index}
                department={item.department}
                subtitle={item.subtitle}
                senderInitials={item.senderInitials}
                senderName={item.senderName}
                messagePreview={item.messagePreview}
                messageCount={item.messageCount}
                date={item.date}
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
