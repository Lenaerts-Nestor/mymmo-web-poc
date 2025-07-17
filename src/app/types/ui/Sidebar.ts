// src/app/types/ui/Sidebar.ts - Updated with unread count

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface SidebarProps {
  personId: string;
  onToggleCollapse: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive: boolean;
  isDisabled?: boolean;
  unreadCount?: number; // NEW: Add unread count support
}

export interface SidebarHeaderProps {}

export interface SidebarFooterProps {
  isLoggingOut: boolean;
  handleLogout: () => void;
}

export interface SidebarNavigationProps {
  personId: string;
  pathname: string;
  router: AppRouterInstance;
}
