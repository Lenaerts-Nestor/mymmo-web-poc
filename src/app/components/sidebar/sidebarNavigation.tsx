"use client";

import type { NavItem, SidebarNavigationProps } from "@/app/types/ui/Sidebar";
import { MapPin, MessageCircle } from "lucide-react";
import Link from "next/link"; // Use Link for navigation

export function SidebarNavigation({
  personId,
  pathname,
  router,
}: SidebarNavigationProps) {
  // 🆕 HELPER: Extract zoneId from current URL
  const getCurrentZoneId = (): string | null => {
    // Check if we're currently on a conversations page
    const conversationsMatch = pathname.match(/^\/conversations\/\d+\/(\d+)/);
    if (conversationsMatch) {
      return conversationsMatch[1]; // Return current zoneId from URL
    }
    return null;
  };

  const handleNavigation = (item: NavItem) => {
    if (item.isDisabled) {
      alert(`${item.label} pagina is nog niet geïmplementeerd.`);
      return;
    }

    // 🎯 FIXED: Handle conversations click with smart zone detection
    if (item.id === "conversations") {
      // 1. First priority: Use current URL zoneId if we're already on conversations
      const currentZoneId = getCurrentZoneId();

      if (currentZoneId) {
        console.log("🔍 [SIDEBAR] Using current URL zoneId:", currentZoneId);
        router.push(`/conversations/${personId}/${currentZoneId}`);
        return;
      }

      // 2. Second priority: Use localStorage if available
      const selectedZoneId =
        typeof window !== "undefined"
          ? localStorage.getItem("selectedZoneId")
          : null;
      if (selectedZoneId) {
        console.log("🔍 [SIDEBAR] Using localStorage zoneId:", selectedZoneId);
        router.push(`/conversations/${personId}/${selectedZoneId}`);
        return;
      }

      // 3. Fallback: Go to zones page for zone selection
      console.log("🔍 [SIDEBAR] No zoneId found, redirecting to zones");
      router.push(`/zones/${personId}`);
      return;
    }

    router.push(item.href);
  };

  const navItems: NavItem[] = [
    {
      id: "zones",
      label: "Zones",
      icon: <MapPin size={20} />,
      href: `/zones/${personId}`,
      isActive: pathname.startsWith(`/zones/${personId}`),
    },
    {
      id: "conversations",
      label: "Conversations",
      icon: <MessageCircle size={20} />,
      href: `/conversations/${personId}`, // This will be handled by the click handler
      isActive: pathname.startsWith(`/conversations/${personId}`),
      isDisabled: false,
    },
  ];

  return (
    <nav className="flex-1 p-4">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href} // Use Link for proper navigation
              onClick={(e) => {
                e.preventDefault(); // Prevent default Link behavior to use custom handleNavigation
                handleNavigation(item);
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${
                  item.isActive
                    ? "bg-[#f5f2de] text-[#552e38] shadow-sm"
                    : "text-[#765860] hover:bg-[#f5f2de]/50 hover:text-[#552e38]"
                }
                ${
                  item.isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-[1.02]"
                }
                focus:outline-none focus:ring-2 focus:ring-[#facf59] focus:ring-offset-2
              `}
              aria-disabled={item.isDisabled}
            >
              <div className="flex items-center gap-3">
                <div className="nav-item__icon">{item.icon}</div>
                <span className="nav-item__label">{item.label}</span>
              </div>

              {/* Unread count badge */}
              {item.unreadCount && item.unreadCount > 0 && (
                <span className="ml-auto bg-[#b00205] text-[#ffffff] text-xs px-2 py-1 rounded-full font-bold">
                  {item.unreadCount}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
