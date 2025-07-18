// src/app/components/sidebar/sidebarNavigation.tsx - FIXED NAVIGATION BUG

import { NavItem, SidebarNavigationProps } from "@/app/types/ui/Sidebar";
import { MapPin, Inbox, MessageCircle } from "lucide-react";
import { useUnreadCounter } from "@/app/contexts/UnreadCounterContext";

export function SidebarNavigation({
  personId,
  pathname,
  router,
}: SidebarNavigationProps) {
  // Safely get global unread counter (might not be available)
  let totalUnreadCount = 0;
  let counterLoading = false;

  try {
    const { totalUnreadCount: count, isLoading } = useUnreadCounter();
    totalUnreadCount = count;
    counterLoading = isLoading;
  } catch (error) {
    console.log(
      "UnreadCounterProvider not available - this is expected on login page"
    );
  }

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
      const selectedZoneId = localStorage.getItem("selectedZoneId");
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
      id: "inbox",
      label: "Inbox",
      icon: <Inbox size={20} />,
      href: `/inbox/${personId}`,
      isActive: pathname.startsWith(`/inbox/${personId}`),
      isDisabled: false,
      unreadCount: totalUnreadCount,
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
            <button
              onClick={() => handleNavigation(item)}
              disabled={item.isDisabled}
              className={`nav-item ${item.isActive ? "nav-item--active" : ""} ${
                item.isDisabled ? "nav-item--disabled" : ""
              }`}
            >
              <div className="nav-item__content">
                <div className="nav-item__icon">{item.icon}</div>
                <span className="nav-item__label">{item.label}</span>
              </div>

              {/* Unread count badge */}
              {item.unreadCount && item.unreadCount > 0 && (
                <span className="nav-item__badge">{item.unreadCount}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
