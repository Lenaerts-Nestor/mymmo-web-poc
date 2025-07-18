// src/app/(dashboard)/conversations/[personId]/[zoneId]/thread/[threadId]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG } from "@/app/constants/app";
import { ChatContent } from "@/app/components/chat";

export default function ChatPage() {
  const { personId, zoneId, threadId } = useParams();
  const router = useRouter();
  const { user } = useUser();

  const translationLang =
    user?.translationLang || APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <DashboardLayout personId={personId as string}>
        <ChatContent
          personId={personId as string}
          zoneId={zoneId as string}
          threadId={threadId as string}
          translationLang={translationLang}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
