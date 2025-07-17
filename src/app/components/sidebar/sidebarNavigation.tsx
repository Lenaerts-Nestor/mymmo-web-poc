// src/app/components/sidebar/sidebarNavigation.tsx - Fixed: Handle missing UnreadCounterProvider

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

  const handleNavigation = (item: NavItem) => {
    if (item.isDisabled) {
      alert(`${item.label} pagina is nog niet geïmplementeerd.`);
      return;
    }

    // Handle conversations click
    if (item.id === "conversations") {
      const selectedZoneId = localStorage.getItem("selectedZoneId");

      if (selectedZoneId) {
        router.push(`/conversations/${personId}/${selectedZoneId}`);
      } else {
        router.push(`/zones/${personId}`);
      }
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
      unreadCount: totalUnreadCount, // Add unread counter
    },
    {
      id: "conversations",
      label: "Conversations",
      icon: <MessageCircle size={20} />,
      href: `/conversations/${personId}`, // This will be handled by the click handler
      isActive: pathname.startsWith(`/conversations/${personId}`),
      isDisabled: false, // Enable conversations
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
                <span className="nav-item__icon">{item.icon}</span>
                <span className="nav-item__label">{item.label}</span>

                {/* Unread counter for inbox */}
                {item.id === "inbox" &&
                  item.unreadCount &&
                  item.unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {item.unreadCount}
                    </span>
                  )}

                {/* Loading indicator for inbox counter */}
                {item.id === "inbox" && counterLoading && (
                  <span className="ml-2 w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></span>
                )}
              </div>

              {item.isDisabled && (
                <span className="nav-item__badge">Binnenkort</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
