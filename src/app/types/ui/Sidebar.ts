export interface SidebarProps {
  personId: string;
  personName?: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive: boolean;
  isDisabled?: boolean;
}
