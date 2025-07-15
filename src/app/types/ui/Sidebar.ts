export interface SidebarProps {
  personId: string;
  personName?: string;
  isCollapsed: boolean;
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
