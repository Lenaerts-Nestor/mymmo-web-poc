// src/components/Sidebar.tsx
"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  MapPin,
  Inbox,
  MessageCircle,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SidebarProps, NavItem } from "../types/ui/Sidebar";

export default function Sidebar({
  personId,
  personName,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
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

  const handleToggleClick = () => {
    onToggleCollapse();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggleClick();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`h-screen fixed left-0 top-0 flex flex-col border-r-2 backdrop-blur-sm transition-transform duration-300 ease-in-out z-40 sidebar-scroll ${
          isCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{
          width: "var(--sidebar-width)",
          backgroundColor: "var(--sidebar-bg)",
          borderColor: "var(--sidebar-border)",
          boxShadow: "var(--sidebar-shadow)",
        }}
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
                      e.currentTarget.style.backgroundColor = "#542e39";
                      e.currentTarget.style.color = "#542e39";
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

      {/* Toggle Button */}
      <button
        onClick={handleToggleClick}
        onKeyDown={handleKeyDown}
        className={`fixed top-6 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:shadow-xl z-50 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 ${
          isCollapsed ? "left-6 hover:scale-110" : "hover:scale-105"
        }`}
        style={{
          width: "var(--toggle-button-size)",
          height: "var(--toggle-button-size)",
          left: isCollapsed ? "24px" : "calc(var(--sidebar-width) - 6px)",
          backgroundColor: "var(--toggle-button-bg)",
          color: "var(--toggle-button-fg)",
          boxShadow: "var(--toggle-button-shadow)",
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--toggle-button-fg)";
          e.currentTarget.style.color = "var(--toggle-button-bg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--toggle-button-bg)";
          e.currentTarget.style.color = "var(--toggle-button-fg)";
        }}
      >
        {isCollapsed ? (
          <ChevronRight size={20} className="ml-0.5" />
        ) : (
          <ChevronLeft size={20} className="mr-0.5" />
        )}
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={handleToggleClick}
          aria-hidden="true"
        />
      )}
    </>
  );
}
