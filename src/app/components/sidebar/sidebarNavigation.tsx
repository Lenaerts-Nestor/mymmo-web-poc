"use client";

import type { NavItem, SidebarNavigationProps } from "@/app/types/ui/Sidebar";
import { MapPin, MessageCircle, Inbox } from "lucide-react";
import Link from "next/link"; // Use Link for navigation
import { useZonesContext } from "@/app/contexts/ZonesContext";

export function SidebarNavigation({
  personId,
  pathname,
  router,
}: SidebarNavigationProps) {
  const { zones } = useZonesContext();
  const getCurrentZoneId = (): string | null => {
    const conversationsMatch = pathname.match(/^\/conversations\/\d+\/(\d+)/);
    if (conversationsMatch) {
      return conversationsMatch[1];
    }
    return null;
  };

  const handleNavigation = (item: NavItem) => {
    if (item.isDisabled) {
      alert(`${item.label} pagina is nog niet geïmplementeerd.`);
      return;
    }

    if (item.id === "conversations") {
      const currentZoneId = getCurrentZoneId();

      if (currentZoneId) {
        router.push(`/conversations/${personId}/${currentZoneId}`);
        return;
      }

      const selectedZoneId =
        typeof window !== "undefined"
          ? localStorage.getItem("selectedZoneId")
          : null;
      if (selectedZoneId) {
        router.push(`/conversations/${personId}/${selectedZoneId}`);
        return;
      }

      router.push(`/zones/${personId}`);
      return;
    }

    router.push(item.href);
  };

  const totalUnreadCount = zones.reduce(
    (sum, zone) => sum + zone.unreadCount,
    0
  );

  const navItems: NavItem[] = [
    {
      id: "inbox",
      label: "Inbox",
      icon: <Inbox size={20} />,
      href: `/inbox/${personId}`,
      isActive: pathname.startsWith(`/inbox/${personId}`),
      isDisabled: false,
      unreadCount: totalUnreadCount > 0 ? totalUnreadCount : undefined,
    },
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
      href: `/conversations/${personId}`,
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
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
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
