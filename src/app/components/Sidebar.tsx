// src/components/Sidebar.tsx
"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, Inbox, MessageCircle, User, LogOut } from "lucide-react";
import { SidebarProps, NavItem } from "../types/ui/Sidebar";

export default function Sidebar({ personId, personName }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

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
      isDisabled: true,
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

  const handleNavigation = (item: NavItem) => {
    if (item.isDisabled) {
      alert(`${item.label} pagina is nog niet geïmplementeerd.`);
      return;
    }
    router.push(item.href);
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div
      className="h-screen w-72 fixed left-0 top-0 flex flex-col border-r-2 border-purple-200/50 backdrop-blur-sm shadow-xl"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Header */}
      <div className="p-6 border-b-2 border-purple-200/30">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
            <User className="text-stone-800" size={22} />
          </div>
          <div>
            <h2 className="font-bold text-lg" style={{ color: "#542e39" }}>
              {personName || `Persoon ${personId}`}
            </h2>
            <p
              className="text-sm font-medium"
              style={{ color: "#542e39", opacity: 0.8 }}
            >
              ID: {personId}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
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
                    e.currentTarget.style.backgroundColor = "#E4DECE";
                    e.currentTarget.style.color = "#542e39";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.isActive && !item.isDisabled) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#E4DECE";
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

      {/* Footer */}
      <div className="p-4 border-t-2 border-purple-200/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold hover:shadow-md hover:scale-[1.01]"
          style={{
            color: "#542e39",
            backgroundColor: "#E4DECE",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#542e39";
            e.currentTarget.style.color = "#E4DECE";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#E4DECE";
            e.currentTarget.style.color = "#542e39";
          }}
        >
          <LogOut size={20} />
          <span className="font-semibold">Uitloggen</span>
        </button>
      </div>
    </div>
  );
}
