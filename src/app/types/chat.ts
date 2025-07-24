// src/app/types/chat.ts - Chat Type Definitions

import { ThreadMessage } from "../services/mymmo-thread-service/apiThreads";

// Chat messages hook result
export interface UseChatMessagesResult {
  messages: ThreadMessage[];
  readMessages: ThreadMessage[];
  unreadMessages: ThreadMessage[];
  isLoading: boolean;
  error: string | null;

  // Message actions
  sendMessage: (text: string, attachments?: any[]) => Promise<boolean>;
  markAsRead: () => Promise<void>;
  refreshMessages: () => Promise<void>;

  // Real-time status
  isConnected: boolean;
  socketStatus: string;
}

// Chat messages hook options
export interface UseChatMessagesOptions {
  threadId: string;
  personId: string;
  zoneId: string;
  transLangId: string;
  autoMarkAsRead?: boolean;
}

// Chat state interface
export interface ChatState {
  messages: ThreadMessage[];
  readMessages: ThreadMessage[];
  unreadMessages: ThreadMessage[];
  lastAccessTime: Date | null;
  optimisticMessages: Set<string>;
}

// Chat actions
export interface ChatActions {
  setMessages: React.Dispatch<React.SetStateAction<ThreadMessage[]>>;
  setReadMessages: React.Dispatch<React.SetStateAction<ThreadMessage[]>>;
  setUnreadMessages: React.Dispatch<React.SetStateAction<ThreadMessage[]>>;
  setLastAccessTime: React.Dispatch<React.SetStateAction<Date | null>>;
  addOptimisticMessage: (id: string) => void;
  removeOptimisticMessage: (id: string) => void;
}
