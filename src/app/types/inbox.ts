import { Thread } from "./threads";

export interface InboxItem {
  zoneId: number;
  zoneName: string;
  zoneDescription: string;
  thread: Thread;
  unreadCount: number;
}

export interface InboxData {
  items: InboxItem[];
  totalUnreadCount: number;
  lastUpdated: string;
}

export interface InboxCardProps {
  item: InboxItem;
  onClick: (zoneId: number, threadId: string) => void;
}

export interface InboxHeaderProps {
  totalUnreadCount: number;
  lastUpdated: string;
}

export interface UseInboxResult {
  inboxData: InboxData;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
