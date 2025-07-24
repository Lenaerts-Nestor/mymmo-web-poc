// src/app/(dashboard)/zones/[personId]/page.tsx - Responsive Design

"use client";

import { useParams, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { ZonesList } from "@/app/components/zones/ZonesList";
import { ZoneIntroCard } from "@/app/components/zones/ZoneIntroCard";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ErrorDisplay } from "@/app/components/ui/ErrorDisplay";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { useUser } from "@/app/contexts/UserContext";
import { APP_CONFIG, UI_MESSAGES } from "@/app/constants/app";
import { ZoneFilter } from "@/app/components/zones/zoneFilter";
import { useZonesContext } from "@/app/contexts/ZonesContext";
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
  const { 
    zones, 
    person, 
    isLoading, 
    error, 
    refetch,
    searchQuery,
    showAllZones,
    setSearchQuery,
    setShowAllZones,
    initialize
  } = useZonesContext();

  // Initialize zones data when component mounts
  React.useEffect(() => {
    initialize(personId, translationLang);
  }, [initialize, personId, translationLang]);

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
  };

  const handleToggleChange = (showAll: boolean) => {
    setShowAllZones(showAll);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
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
    <div className="w-full min-h-screen">
      {/* Container with better width usage */}
      <div className="w-full px-6 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <ZoneIntroCard
            person={person}
            personId={personId}
            appLang={appLang}
            translationLang={translationLang}
          />
        </div>

        {/* Controls Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Toggle Section */}
            <div className="flex-1">
              <ZonesToggle
                showAllZones={showAllZones}
                onToggleChange={handleToggleChange}
              />
            </div>

            {/* Search Section */}
            <div className="lg:w-80">
              <ZoneFilter onSearchChange={handleSearchChange} />
            </div>
          </div>
        </div>

        {/* Zones List Section */}
        <ZonesList
          zones={zones}
          isLoading={isLoading}
          search={searchQuery}
          showAllZones={showAllZones}
          personId={personId}
          translationLang={translationLang}
        />
      </div>
    </div>
  );
}
