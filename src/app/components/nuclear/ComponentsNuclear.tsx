// src/app/components/nuclear/ComponentsNuclear.tsx - NUCLEAR CLEANUP
"use client";

import React, { memo, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, Inbox, MessageCircle, LogOut } from "lucide-react";
import { useUnifiedApp } from "../../contexts/UnifiedAppContext";
import { ZoneWithUnreadCount } from "@/app/hooks/useZones";

// ===== NUCLEAR SIDEBAR =====
export const SidebarNuclear = memo(function SidebarNuclear() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, globalUnreadCount } = useUnifiedApp();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, router, isLoggingOut]);

  const navItems = useMemo(() => {
    if (!user) return [];

    return [
      {
        id: "zones",
        label: "Zones",
        icon: <MapPin size={20} />,
        href: `/zones/${user.personId}`,
        isActive: pathname.startsWith(`/zones/${user.personId}`),
        unreadCount: 0,
      },
      {
        id: "inbox",
        label: "Inbox",
        icon: <Inbox size={20} />,
        href: `/inbox/${user.personId}`,
        isActive: pathname.startsWith(`/inbox/${user.personId}`),
        unreadCount: globalUnreadCount,
      },
      {
        id: "conversations",
        label: "Conversations",
        icon: <MessageCircle size={20} />,
        href: `/conversations/${user.personId}`,
        isActive: pathname.startsWith(`/conversations/${user.personId}`),
        unreadCount: 0,
      },
    ];
  }, [user, pathname, globalUnreadCount]);

  const handleNavClick = useCallback(
    (item: any) => {
      if (item.id === "conversations") {
        const selectedZoneId = localStorage.getItem("selectedZoneId");
        if (selectedZoneId) {
          router.push(`/conversations/${user?.personId}/${selectedZoneId}`);
        } else {
          router.push(`/zones/${user?.personId}`);
        }
      } else {
        router.push(item.href);
      }
    },
    [router, user]
  );

  if (!user) return null;

  return (
    <div
      className="h-screen fixed left-0 top-0 flex flex-col border-r-2 backdrop-blur-sm transition-transform duration-300 ease-in-out z-40"
      style={{
        width: "var(--sidebar-width)",
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--sidebar-border)",
        boxShadow: "var(--sidebar-shadow)",
      }}
    >
      {/* Header */}
      <SidebarHeaderNuclear />

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <SidebarNavItemNuclear
              key={item.id}
              item={item}
              onClick={() => handleNavClick(item)}
            />
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <SidebarFooterNuclear
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />
    </div>
  );
});

// ===== SIDEBAR SUB-COMPONENTS =====
const SidebarHeaderNuclear = memo(function SidebarHeaderNuclear() {
  return (
    <div className="flex items-center justify-center p-4 border-b border-gray-500">
      <button
        className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium hover:shadow-md hover:scale-[1.02]"
        style={{ backgroundColor: "#E4DECE", color: "#542e39" }}
        onClick={() => alert("Profile functionality coming soon")}
      >
        <span className="text-2xl">👤</span>
        <span className="font-semibold">Profile</span>
      </button>
    </div>
  );
});

interface NavItemProps {
  item: {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    isActive: boolean;
    unreadCount: number;
  };
  onClick: () => void;
}

const SidebarNavItemNuclear = memo(function SidebarNavItemNuclear({
  item,
  onClick,
}: NavItemProps) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`nav-item ${item.isActive ? "nav-item--active" : ""}`}
      >
        <div className="nav-item__content">
          <div className="nav-item__icon">{item.icon}</div>
          <span className="nav-item__label">{item.label}</span>
        </div>

        {item.unreadCount > 0 && (
          <span className="nav-item__badge">{item.unreadCount}</span>
        )}
      </button>
    </li>
  );
});

interface SidebarFooterProps {
  isLoggingOut: boolean;
  onLogout: () => void;
}

const SidebarFooterNuclear = memo(function SidebarFooterNuclear({
  isLoggingOut,
  onLogout,
}: SidebarFooterProps) {
  return (
    <div className="p-4 border-t-2 border-purple-200/30">
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        className="logout-button"
      >
        <LogOut size={20} />
        <span>{isLoggingOut ? "Uitloggen..." : "Uitloggen"}</span>
      </button>
    </div>
  );
});

// ===== NUCLEAR ZONE CARD =====
interface ZoneCardNuclearProps {
  zone: ZoneWithUnreadCount;
}

export const ZoneCardNuclear = memo(function ZoneCardNuclear({
  zone,
}: ZoneCardNuclearProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    const pathSegments = window.location.pathname.split("/");
    const personIdIndex =
      pathSegments.findIndex((segment) => segment === "zones") + 1;
    const personId = pathSegments[personIdIndex];

    if (personId) {
      localStorage.setItem("selectedZoneId", zone.zoneId.toString());
      router.push(`/conversations/${personId}/${zone.zoneId}`);
    }
  }, [router, zone.zoneId]);

  const backgroundClass = useMemo(() => {
    const backgrounds = [
      "bg-purple-100",
      "bg-green-100",
      "bg-pink-100",
      "bg-yellow-50",
      "bg-blue-50",
      "bg-orange-50",
    ];
    return backgrounds[zone.zoneId % backgrounds.length];
  }, [zone.zoneId]);

  const cardClasses = useMemo(
    () => `
    ${backgroundClass} rounded-2xl p-6 shadow-md transition-all duration-200 border-0 cursor-pointer
    ${
      zone.hasUnreadMessages
        ? "hover:shadow-xl hover:scale-[1.03] ring-2 ring-blue-400 ring-opacity-50"
        : "hover:shadow-lg hover:scale-[1.02]"
    }
  `,
    [backgroundClass, zone.hasUnreadMessages]
  );

  return (
    <div onClick={handleClick} className={`relative ${cardClasses}`}>
      {/* Unread indicator header */}
      {zone.hasUnreadMessages && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-red-600">
              Nieuwe berichten
            </span>
          </div>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            {zone.unreadCount}
          </span>
        </div>
      )}

      <h3 className="font-bold text-xl text-stone-800 mb-3 leading-tight">
        {zone.name}
      </h3>

      <p className="text-base text-stone-600 mb-4 font-medium">
        {zone.formattedAddress}
      </p>

      <div className="bg-white/60 rounded-xl p-3 mb-4 text-sm text-stone-500">
        <p className="font-medium">
          Zone ID: <span className="text-amber-600">{zone.zoneId}</span> | Plot
          ID: <span className="text-amber-600">{zone.plotId}</span>
        </p>
        <p className="mt-1">
          {zone.street}, {zone.postalCode} {zone.city}
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-amber-600 font-bold text-sm bg-amber-50 px-3 py-1 rounded-full">
          {zone.entityCount} entities
        </span>
        <span
          className={`px-3 py-1 rounded-full font-bold text-sm ${
            zone.isPublic
              ? "bg-emerald-500 text-white"
              : "bg-orange-400 text-white"
          }`}
        >
          {zone.isPublic ? "Public" : "Private"}
        </span>
      </div>

      {/* Enhanced footer with conversation info */}
      <div className="flex justify-between items-center text-sm">
        <div className="text-stone-400 font-medium">
          {zone.personIds.length} person(s) linked
        </div>

        <div className="flex items-center space-x-2">
          {zone.hasUnreadMessages ? (
            <div className="flex items-center space-x-1 text-red-600">
              <span className="text-xs">💬</span>
              <span className="text-xs font-medium">
                {zone.unreadCount} ongelezen
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-gray-500">
              <span className="text-xs">💬</span>
              <span className="text-xs">Alle berichten gelezen</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ===== NUCLEAR ZONES LIST =====
interface ZonesListNuclearProps {
  zones: ZoneWithUnreadCount[];
  isLoading: boolean;
  search?: string;
  showAllZones: boolean;
}

// In your ComponentsNuclear.tsx - Replace ZonesListNuclear with this:

export const ZonesListNuclear = memo(function ZonesListNuclear({
  zones,
  isLoading,
  search,
  showAllZones,
}: ZonesListNuclearProps) {
  const filteredZones = useMemo(() => {
    let filtered = search
      ? zones.filter(
          (zone) =>
            zone.name.toLowerCase().includes(search.toLowerCase()) ||
            zone.formattedAddress.toLowerCase().includes(search.toLowerCase())
        )
      : zones;

    if (!showAllZones) {
      filtered = filtered.filter((zone) => zone.hasUnreadMessages);
    }

    return filtered;
  }, [zones, search, showAllZones]);

  // Simple loading - just show spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading zones...</p>
        </div>
      </div>
    );
  }

  // No zones at all
  if (zones.length === 0) {
    return (
      <div className="bg-white/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
        <div className="text-center py-12">
          <div className="text-6xl mb-6">🏗️</div>
          <p className="text-2xl font-bold mb-3 text-stone-700">
            Geen zones gevonden
          </p>
          <p className="text-lg text-stone-500">
            Er zijn geen zones gevonden voor deze persoon.
          </p>
        </div>
      </div>
    );
  }

  // No zones match filter
  if (filteredZones.length === 0) {
    return (
      <div className="bg-white/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
        <div className="text-center py-12">
          <div className="text-6xl mb-6">📬</div>
          <p className="text-2xl font-bold mb-3 text-stone-700">
            {showAllZones
              ? "Geen zones gevonden"
              : "Geen zones met ongelezen berichten"}
          </p>
          <p className="text-lg text-stone-500">
            {showAllZones
              ? search
                ? `Geen zones gevonden voor "${search}"`
                : "Geen zones beschikbaar"
              : "Alle berichten zijn gelezen."}
          </p>
        </div>
      </div>
    );
  }

  // Show zones
  return (
    <div className="bg-white/70 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-stone-800">
          {showAllZones ? "Alle Zones" : "Zones met Ongelezen Berichten"} (
          {filteredZones.length})
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live updates</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredZones.map((zone) => (
          <ZoneCardNuclear key={zone.zoneId} zone={zone} />
        ))}
      </div>
    </div>
  );
});
