// src/app/(dashboard)/zones/[personId]/page.tsx
"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ZonesList } from "@/app/components/zones/ZonesList";
import { ZoneIntroCard } from "@/app/components/zones/ZoneIntroCard";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { useZones } from "@/app/hooks/useZones";
import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG, UI_MESSAGES } from "@/app/constants/app";
import { ZoneFilter } from "@/app/components/zones/zoneFilter";

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
    <div className="max-w-9/10 mx-auto">
      <ZoneIntroCard
        person={person}
        personId={personId}
        appLang={appLang}
        translationLang={translationLang}
      />
      <ZoneFilter onSearchChange={handleSearchChange} />
      <ZonesList zones={zones} isLoading={isLoading} search={searchQuery} />
    </div>
  );
}
