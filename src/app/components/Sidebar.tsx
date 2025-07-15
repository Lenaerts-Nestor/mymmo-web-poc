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
    <div className="bg-white shadow-lg h-screen w-64 fixed left-0 top-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
            <User className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">
              {personName || `Persoon ${personId}`}
            </h2>
            <p className="text-sm text-gray-500">ID: {personId}</p>
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  item.isActive
                    ? "bg-blue-600 text-white"
                    : item.isDisabled
                    ? "text-gray-400 cursor-not-allowed hover:bg-gray-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className={item.isDisabled ? "opacity-50" : ""}>
                  {item.icon}
                </span>
                <span
                  className={`font-medium ${
                    item.isDisabled ? "opacity-50" : ""
                  }`}
                >
                  {item.label}
                </span>
                {item.isDisabled && (
                  <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    Binnenkort
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Uitloggen</span>
        </button>
      </div>
    </div>
  );
}
