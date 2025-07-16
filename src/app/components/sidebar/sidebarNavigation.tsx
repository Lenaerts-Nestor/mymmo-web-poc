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
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 font-medium ${
                item.isActive
                  ? "shadow-lg transform scale-[1.02]"
                  : item.isDisabled
                  ? "cursor-not-allowed"
                  : "hover:shadow-md hover:scale-[1.01]"
              }`}
              style={{
                backgroundColor: item.isActive ? "#E4DECE" : "transparent",
                color: item.isActive
                  ? "#542e39"
                  : item.isDisabled
                  ? "#542e39"
                  : "#542e39",
                opacity: item.isDisabled ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!item.isActive && !item.isDisabled) {
                  e.currentTarget.style.backgroundColor = "#542e39";
                  e.currentTarget.style.color = "#E4DECE";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.isActive && !item.isDisabled) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="font-semibold truncate">{item.label}</span>
              </div>
              {item.isDisabled && (
                <span
                  className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ml-2"
                  style={{
                    backgroundColor: "#E4DECE",
                    color: "#542e39",
                    border: "1px solid #542e39",
                  }}
                >
                  Binnenkort
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
