"use client";

import { MapPin, MessageCircle, Bell, Search } from "lucide-react"; // Added icons
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
          {" "}
          {/* primary-offwhite */}
          <div className="h-6 bg-[#cfc4c7] rounded-lg mb-3"></div>{" "}
          {/* gravel-100 */}
          <div className="h-4 bg-[#cfc4c7] rounded-lg mb-4"></div>{" "}
          {/* gravel-100 */}
          <div className="bg-[#ffffff]/60 rounded-xl p-3 mb-4">
            {" "}
            {/* pure-white/60 */}
            <div className="h-3 bg-[#cfc4c7] rounded mb-2"></div>{" "}
            {/* gravel-100 */}
            <div className="h-3 bg-[#cfc4c7] rounded"></div> {/* gravel-100 */}
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-[#cfc4c7] rounded-full w-20"></div>{" "}
            {/* gravel-100 */}
            <div className="h-6 bg-[#cfc4c7] rounded-full w-16"></div>{" "}
            {/* gravel-100 */}
          </div>
          <div className="h-3 bg-[#cfc4c7] rounded w-24"></div>{" "}
          {/* gravel-100 */}
        </div>
      ))}
    </div>
  );
}

function EmptyZonesState({ showAllZones }: { showAllZones: boolean }) {
  return (
    <div className="text-center py-12 text-[#765860]">
      {" "}
      {/* gravel-500 */}
      <div className="text-6xl mb-6">
        {showAllZones ? (
          <MapPin className="w-16 h-16 mx-auto text-[#a69298]" />
        ) : (
          <MessageCircle className="w-16 h-16 mx-auto text-[#a69298]" />
        )}{" "}
        {/* gravel-300 */}
      </div>
      <p className="text-2xl font-bold mb-3 text-[#552e38]">
        {" "}
        {/* primary-wine */}
        {showAllZones
          ? "Geen zones gevonden"
          : "Geen zones met ongelezen berichten"}
      </p>
      <p className="text-lg text-[#765860]">
        {" "}
        {/* gravel-500 */}
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

  // Apply search filter
  let filteredZones = search
    ? zones.filter(
        (zone) =>
          zone.name.toLowerCase().includes(search.toLowerCase()) ||
          zone.formattedAddress.toLowerCase().includes(search.toLowerCase())
      )
    : zones;
  // Apply unread filter
  if (!showAllZones) {
    filteredZones = filteredZones.filter((zone) => zone.hasUnreadMessages);
  }

  // Reset to first page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, showAllZones, zones.length]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredZones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedZones = filteredZones.slice(startIndex, endIndex);

  if (filteredZones.length === 0) {
    return (
      <div className="bg-[var(--pure-white)]/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
        {/* pure-white/70 */}
        <EmptyZonesState showAllZones={showAllZones} />
      </div>
    );
  }

  // Calculate statistics
  const totalUnreadCount = filteredZones.reduce(
    (sum, zone) => sum + zone.unreadCount,
    0
  );
  const zonesWithUnreadCount = filteredZones.filter(
    (zone) => zone.hasUnreadMessages
  ).length;

  return (
    <div className="bg-[var(--pure-white)]/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
      {/* pure-white/70 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-[var(--primary-wine)] mb-2">
            {" "}
            {/* primary-wine */}
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
          {/* Statistics */}
          <div className="flex items-center gap-4 text-sm text-[var(--gravel-500)]">
            {" "}
            {/* gravel-500 */}
            <div className="flex items-center gap-1">
              <Bell className="w-4 h-4 text-[var(--error)]" />{" "}
              {/* error color */}
              <span>
                {totalUnreadCount} ongelezen{" "}
                {totalUnreadCount === 1 ? "bericht" : "berichten"}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-[var(--primary-sunglow)]" />{" "}
              {/* primary-sunglow */}
              <span>
                {zonesWithUnreadCount} van {zones.length} zones heeft ongelezen
                berichten
              </span>
            </div>
            {search && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Search className="w-4 h-4 text-[var(--gravel-300)]" />{" "}
                  {/* gravel-300 */}
                  <span>Gefilterd op: "{search}"</span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[var(--secondary-tea)] rounded-full animate-pulse"></div>
          {/* secondary-tea */}
          <span className="text-sm text-[var(--gravel-500)]">Live updates</span>
          {/* gravel-500 */}
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
                  // Show first page, last page, current page, and pages around current page
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
