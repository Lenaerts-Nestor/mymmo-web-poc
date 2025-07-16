"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { ZonesList } from "@/app/components/zones/ZonesList";
import { ZoneIntroCard } from "@/app/components/zones/ZoneIntroCard";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { useZones } from "@/app/hooks/useZones";
import { APP_CONFIG, UI_MESSAGES } from "@/app/constants/app";
import { ZoneFilter } from "@/app/components/zones/zoneFilter";

export default function ZonesPage() {
  const { personId } = useParams();
  const searchParams = useSearchParams();

  const appLang = searchParams.get("appLang") || APP_CONFIG.DEFAULT_LANGUAGE;
  const translationLang =
    searchParams.get("translationLang") ||
    APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  return (
    <ProtectedRoute requiredPersonId={personId as string}>
      <ZonesContent
        personId={personId as string}
        appLang={appLang}
        translationLang={translationLang}
      />
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
  const { zones, person, isLoading, error, refetch } = useZones(
    personId,
    translationLang
  );

  // Client-side search state
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  if (isLoading) {
    return (
      <DashboardLayout personId={personId as string} personName="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner message={UI_MESSAGES.LOADING.ZONES} />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout personId={personId as string} personName="">
        <div className="flex items-center justify-center min-h-screen">
          <ErrorDisplay error={error} onRetry={refetch} />
        </div>
      </DashboardLayout>
    );
  }

  const personName = `${person.firstName} ${person.lastName}`;

  return (
    <DashboardLayout personId={personId as string} personName={personName}>
      <ZoneIntroCard
        person={person}
        personId={personId as string}
        appLang={appLang}
        translationLang={translationLang}
      />
      <ZoneFilter onSearchChange={handleSearchChange} />
      <ZonesList zones={zones} isLoading={isLoading} search={searchQuery} />
    </DashboardLayout>
  );
}
