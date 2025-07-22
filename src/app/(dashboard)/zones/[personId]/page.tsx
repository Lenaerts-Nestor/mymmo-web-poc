"use client";

import { useParams } from "next/navigation";
import { useState, memo } from "react";
import { useUnifiedApp } from "@/app/contexts/UnifiedAppContext";
import {
  SidebarNuclear,
  ZonesListNuclear,
} from "@/app/components/nuclear/ComponentsNuclear";
import { ZoneFilter } from "@/app/components/zones/zoneFilter";
import { ZonesToggle } from "@/app/components/zones/ZonesToggle";
import { ZoneIntroCard } from "@/app/components/zones/ZoneIntroCard";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { APP_CONFIG } from "@/app/constants/app";
import { useZonesNuclear } from "@/app/hooks/useZonesNuclear";

export default function ZonesPageNuclear() {
  const { personId } = useParams();
  const { user } = useUnifiedApp();

  const translationLang =
    user?.translationLang || APP_CONFIG.DEFAULT_TRANSLATION_LANGUAGE;

  return (
    <ZonesContentNuclear
      personId={personId as string}
      translationLang={translationLang}
    />
  );
}

// ===== MEMOIZED ZONES CONTENT =====
const ZonesContentNuclear = memo(function ZonesContentNuclear({
  personId,
  translationLang,
}: {
  personId: string;
  translationLang: string;
}) {
  const { zones, person, isLoading, error } = useZonesNuclear(
    personId,
    translationLang
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllZones, setShowAllZones] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <HeaderSectionNuclear person={person} personId={personId} />

        {/* Controls */}
        <ControlsSectionNuclear
          showAllZones={showAllZones}
          onToggleChange={setShowAllZones}
          onSearchChange={setSearchQuery}
        />

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

// ===== MEMOIZED SUB-COMPONENTS =====
const HeaderSectionNuclear = memo(function HeaderSectionNuclear({
  person,
  personId,
}: {
  person: any;
  personId: string;
}) {
  return (
    <div className="mb-6">
      <ZoneIntroCard
        person={person}
        personId={personId}
        appLang="nl"
        translationLang="nl"
      />
    </div>
  );
});

const ControlsSectionNuclear = memo(function ControlsSectionNuclear({
  showAllZones,
  onToggleChange,
  onSearchChange,
}: {
  showAllZones: boolean;
  onToggleChange: (show: boolean) => void;
  onSearchChange: (search: string) => void;
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <ZonesToggle
            showAllZones={showAllZones}
            onToggleChange={onToggleChange}
          />
        </div>
        <div className="lg:w-80">
          <ZoneFilter onSearchChange={onSearchChange} />
        </div>
      </div>
    </div>
  );
});
