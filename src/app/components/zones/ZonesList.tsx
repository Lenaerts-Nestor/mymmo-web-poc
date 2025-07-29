"use client";

import { MapPin, MessageCircle, Bell, Search } from "lucide-react";
import { ZoneCard } from "./ZoneCard";
import type { Zone } from "@/app/types/zones";
import { useState, useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface ZoneWithUnreadCount extends Zone {
  unreadCount: number;
  hasUnreadMessages: boolean;
}

interface UpdatedZonesListProps {
  zones: ZoneWithUnreadCount[];
  isLoading: boolean;
  search?: string;
  showAllZones: boolean;
  personId: string;
  translationLang: string;
}

function ZonesListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-[#f5f2de] rounded-2xl p-6 animate-pulse shadow-md"
        >
          <div className="h-6 bg-[#cfc4c7] rounded-lg mb-3"></div>{" "}
          <div className="h-4 bg-[#cfc4c7] rounded-lg mb-4"></div>{" "}
          <div className="bg-[#ffffff]/60 rounded-xl p-3 mb-4">
            <div className="h-3 bg-[#cfc4c7] rounded mb-2"></div>{" "}
            <div className="h-3 bg-[#cfc4c7] rounded"></div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-[#cfc4c7] rounded-full w-20"></div>{" "}
            <div className="h-6 bg-[#cfc4c7] rounded-full w-16"></div>{" "}
          </div>
          <div className="h-3 bg-[#cfc4c7] rounded w-24"></div>{" "}
        </div>
      ))}
    </div>
  );
}

function EmptyZonesState({ showAllZones }: { showAllZones: boolean }) {
  return (
    <div className="text-center py-12 text-[#765860]">
      <div className="text-6xl mb-6">
        {showAllZones ? (
          <MapPin className="w-16 h-16 mx-auto text-[#a69298]" />
        ) : (
          <MessageCircle className="w-16 h-16 mx-auto text-[#a69298]" />
        )}
      </div>
      <p className="text-2xl font-bold mb-3 text-[#552e38]">
        {showAllZones
          ? "Geen zones gevonden"
          : "Geen zones met ongelezen berichten"}
      </p>
      <p className="text-lg text-[#765860]">
        {showAllZones
          ? "Er zijn geen zones gevonden voor deze persoon."
          : "Alle berichten zijn gelezen. Gebruik 'Toon alle zones' om alle zones te bekijken."}
      </p>
    </div>
  );
}

export function ZonesList({
  zones,
  isLoading,
  search,
  showAllZones,
  personId,
  translationLang,
}: UpdatedZonesListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  if (isLoading) return <ZonesListSkeleton />;

  let filteredZones = search
    ? zones.filter(
        (zone) =>
          zone.name.toLowerCase().includes(search.toLowerCase()) ||
          zone.formattedAddress.toLowerCase().includes(search.toLowerCase())
      )
    : zones;
  if (!showAllZones) {
    filteredZones = filteredZones.filter((zone) => zone.hasUnreadMessages);
  }

  useMemo(() => {
    setCurrentPage(1);
  }, [search, showAllZones, zones.length]);

  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedZones = filteredZones.slice(startIndex, endIndex);

  if (filteredZones.length === 0) {
    return (
      <div className="bg-[var(--pure-white)]/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
        <EmptyZonesState showAllZones={showAllZones} />
      </div>
    );
  }

  const totalUnreadCount = filteredZones.reduce(
    (sum, zone) => sum + zone.unreadCount,
    0
  );
  const zonesWithUnreadCount = filteredZones.filter(
    (zone) => zone.hasUnreadMessages
  ).length;

  return (
    <div className="bg-[var(--pure-white)]/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[var(--primary-wine)] mb-2">
            {showAllZones ? "Alle Zones" : "Zones met Ongelezen Berichten"} (
            {filteredZones.length})
          </h2>
          {totalPages > 1 && (
            <p className="text-sm text-[var(--gravel-500)] mb-2">
              Pagina {currentPage} van {totalPages} • Toont {startIndex + 1}-
              {Math.min(endIndex, filteredZones.length)} van{" "}
              {filteredZones.length} zones
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-[var(--gravel-500)]">
            <div className="flex items-center gap-1">
              <Bell className="w-4 h-4 text-[var(--error)]" />{" "}
              <span>
                {totalUnreadCount} ongelezen{" "}
                {totalUnreadCount === 1 ? "bericht" : "berichten"}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-[var(--primary-sunglow)]" />{" "}
              <span>
                {zonesWithUnreadCount} van {zones.length} zones heeft ongelezen
                berichten
              </span>
            </div>
            {search && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Search className="w-4 h-4 text-[var(--gravel-300)]" />
                  <span>Gefilterd op: "{search}"</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedZones.map((zone) => (
          <ZoneCard
            key={zone.zoneId}
            zone={zone}
            unreadCount={zone.unreadCount}
            hasUnreadMessages={zone.hasUnreadMessages}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={
                    currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => {
                  const showPage =
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1);

                  if (!showPage) {
                    // Show ellipsis for gaps
                    if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <span className="flex h-9 w-9 items-center justify-center text-[var(--gravel-500)]">
                            ...
                          </span>
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
