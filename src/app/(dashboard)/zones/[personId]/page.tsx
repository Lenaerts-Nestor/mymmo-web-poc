// src/app/(dashboard)/zones/[personId]/page.tsx - SIMPLE FIX
"use client";

import { useParams } from "next/navigation";
import { useState, memo } from "react";
import { useUnifiedApp } from "@/app/contexts/UnifiedAppContext";
import { ZonesListNuclear } from "@/app/components/nuclear/ComponentsNuclear";
import { ZoneFilter } from "@/app/components/zones/zoneFilter";
import { ZonesToggle } from "@/app/components/zones/ZonesToggle";
import { ZoneIntroCard } from "@/app/components/zones/ZoneIntroCard";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { APP_CONFIG } from "@/app/constants/app";
import { useZones } from "@/app/hooks/useZones";

export default function ZonesPageNuclear() {
  const { personId } = useParams();
  const { user, isUserLoading } = useUnifiedApp();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  const translationLang =
    user.translationLang || APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  return (
    <ZonesContentNuclear
      personId={personId as string}
      translationLang={translationLang}
    />
  );
}

const ZonesContentNuclear = memo(function ZonesContentNuclear({
  personId,
  translationLang,
}: {
  personId: string;
  translationLang: string;
}) {
  const { zones, person, isLoading, error } = useZones(
    personId,
    translationLang
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllZones, setShowAllZones] = useState(true);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>Error loading zones: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-6 py-6">
        {/* Header */}
        {person?.firstName && (
          <div className="mb-6">
            <ZoneIntroCard
              person={person}
              personId={personId}
              appLang="nl"
              translationLang="nl"
            />
          </div>
        )}

        {/* Controls */}
        {zones.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <ZonesToggle
                showAllZones={showAllZones}
                onToggleChange={setShowAllZones}
              />
              <div className="lg:w-80">
                <ZoneFilter onSearchChange={setSearchQuery} />
              </div>
            </div>
          </div>
        )}

        {/* Zones List */}
        <ZonesListNuclear
          zones={zones}
          isLoading={isLoading}
          search={searchQuery}
          showAllZones={showAllZones}
        />
      </div>
    </div>
  );
});
