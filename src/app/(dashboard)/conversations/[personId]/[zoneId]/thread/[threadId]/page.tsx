// src/app/(dashboard)/conversations/[personId]/[zoneId]/thread/[threadId]/page.tsx - FIXED CONTEXT

"use client";

import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { useUnifiedApp } from "@/app/contexts/UnifiedAppContext"; // FIXED: Use unified context
import { APP_CONFIG } from "@/app/constants/app";
import { ChatContent } from "@/app/components/chat";

export default function ChatPage() {
  const { personId, zoneId, threadId } = useParams();
  const router = useRouter();
  const { user, isUserLoading } = useUnifiedApp(); // FIXED: Use unified context

  // Wait for user context to be ready
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user session...</p>
        </div>
      </div>
    );
  }

  // If no user after loading, redirect to login
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const translationLang =
    user.translationLang || APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

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
