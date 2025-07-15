"use client";

import { useParams, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { ZonesList } from "@/app/components/zones/ZonesList";
import { PersonInfo } from "@/app/components/zones/PersonInfo";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { useZones } from "@/app/hooks/useZones";
import { APP_CONFIG, UI_MESSAGES } from "@/app/constants/app";

export default function ZonesPage() {
  const { personId } = useParams();
  const searchParams = useSearchParams();

  const appLang = searchParams.get("appLang") || APP_CONFIG.DEFAULT_LANGUAGE;
  const translationLang =
    searchParams.get("translationLang") ||
    APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  const { zones, person, isLoading, error, refetch } = useZones(
    personId as string,
    translationLang
  );

  const personName = person
    ? `${person.firstName} ${person.lastName}`
    : undefined;

  if (isLoading) {
    return (
      <DashboardLayout personId={personId as string} personName={personName}>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner message={UI_MESSAGES.LOADING.ZONES} />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout personId={personId as string} personName={personName}>
        <div className="flex items-center justify-center min-h-screen">
          <ErrorDisplay error={error} onRetry={refetch} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout personId={personId as string} personName={personName}>
      <PersonInfo
        person={person}
        personId={personId as string}
        appLang={appLang}
        translationLang={translationLang}
      />
      <ZonesList zones={zones} isLoading={isLoading} />
    </DashboardLayout>
  );
}
