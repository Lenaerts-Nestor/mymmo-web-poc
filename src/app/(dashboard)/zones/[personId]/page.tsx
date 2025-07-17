// src/app/(dashboard)/zones/[personId]/page.tsx - Updated with unread conversations

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ZonesList } from "@/app/components/zones/ZonesList";
import { ZoneIntroCard } from "@/app/components/zones/ZoneIntroCard";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG, UI_MESSAGES } from "@/app/constants/app";
import { ZoneFilter } from "@/app/components/zones/zoneFilter";
import { useZonesWithUnreadCounts } from "@/app/hooks/useZonesWithUnreadCounts";
import { ZonesToggle } from "@/app/components/zones/ZonesToggle";

export default function ZonesPage() {
  const { personId } = useParams();
  const searchParams = useSearchParams();
  const { user } = useUser();

  const appLang =
    searchParams.get("appLang") || user?.appLang || APP_CONFIG.DEFAULT_LANGUAGE;
  const translationLang =
    searchParams.get("translationLang") ||
    user?.translationLang ||
    APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <DashboardLayout personId={personId as string}>
        <ZonesContent
          personId={personId as string}
          appLang={appLang}
          translationLang={translationLang}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ZonesContent({
  personId,
  appLang,
  translationLang,
}: {
  personId: string;
  appLang: string;
  translationLang: string;
}) {
  const { zones, person, isLoading, error, refetch } = useZonesWithUnreadCounts(
    personId,
    translationLang
  );

  // Client-side search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllZones, setShowAllZones] = useState(false);

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  const handleToggleChange = (showAll: boolean) => {
    setShowAllZones(showAll);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message={UI_MESSAGES.LOADING.ZONES} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorDisplay error={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <ZoneIntroCard
        person={person}
        personId={personId}
        appLang={appLang}
        translationLang={translationLang}
      />

      {/* Controls container */}
      <div className="flex justify-between items-center mb-6">
        <ZonesToggle
          showAllZones={showAllZones}
          onToggleChange={handleToggleChange}
        />
        <ZoneFilter onSearchChange={handleSearchChange} />
      </div>

      <ZonesList
        zones={zones}
        isLoading={isLoading}
        search={searchQuery}
        showAllZones={showAllZones}
        personId={personId}
        translationLang={translationLang}
      />
    </div>
  );
}
