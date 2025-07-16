import { NavItem, SidebarNavigationProps } from "@/app/types/ui/Sidebar";
import { MapPin, Inbox, MessageCircle } from "lucide-react";

export function SidebarNavigation({
  personId,
  pathname,
  router,
}: SidebarNavigationProps) {
  const handleNavigation = (item: NavItem) => {
    if (item.isDisabled) {
      alert(`${item.label} pagina is nog niet geïmplementeerd.`);
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
    },
    {
      id: "conversations",
      label: "Conversations",
      icon: <MessageCircle size={20} />,
      href: `/conversations/${personId}`,
      isActive: pathname.startsWith(`/conversations/${personId}`),
      isDisabled: true,
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
