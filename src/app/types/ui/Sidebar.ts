import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface SidebarProps {
  personId: string;
  personName: string;
  onToggleCollapse: () => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive: boolean;
  isDisabled?: boolean;
}

export interface SidebarHeaderProps {
  personName: string | undefined;
}

export interface SidebarFooterProps {
  isLoggingOut: boolean;
  handleLogout: () => void;
}

export interface SidebarNavigationProps {
  personId: string;
  pathname: string;
  router: AppRouterInstance;
}
