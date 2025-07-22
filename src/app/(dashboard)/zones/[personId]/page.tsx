"use client";

import { useParams } from "next/navigation";
import { useState, memo, useEffect } from "react";
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
  const { user, isUserLoading } = useUnifiedApp();

  // Wait for user context to be ready
  if (isUserLoading) {
    return <CentralLoadingSpinner message="Loading user session..." />;
  }

  // If no user after loading, redirect to login
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

// ===== IMPROVED LOADING SPINNER =====
function CentralLoadingSpinner({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 text-lg">{message}</p>
        <div className="mt-2 text-sm text-gray-500">
          Getting everything ready for you...
        </div>
      </div>
    </div>
  );
}

// ===== MEMOIZED ZONES CONTENT WITH SIMPLIFIED LOADING =====
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

  // ===== SIMPLIFIED LOADING - Show zones as soon as they're available =====
  const shouldShowLoading =
    isLoading && (!person?.firstName || zones.length === 0);

  // Show loading only if we don't have basic data yet
  if (shouldShowLoading) {
    const message = !person?.firstName
      ? "Loading user information..."
      : "Loading zones...";

    return <CentralLoadingSpinner message={message} />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600 bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl font-semibold mb-2">Error loading zones</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry Loading
          </button>
        </div>
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
          isLoading={false} // Never show loading here since we handle it above
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
