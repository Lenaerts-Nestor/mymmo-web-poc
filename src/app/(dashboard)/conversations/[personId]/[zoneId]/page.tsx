"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG } from "@/app/constants/app";
import { ConversationsContent } from "@/app/components/conversation/ConversationsContent";

export default function ConversationsPage() {
  const { personId, zoneId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const translationLang =
    searchParams.get("translationLang") ||
    user?.translationLang ||
    APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  // Handle case where no zone is selected
  if (!zoneId) {
    router.push(`/zones/${personId}`);
    return null;
  }

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <DashboardLayout personId={personId as string}>
        <ConversationsContent
          personId={personId as string}
          zoneId={zoneId as string}
          translationLang={translationLang}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
