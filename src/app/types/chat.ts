// src/app/types/chat.ts - Chat Type Definitions

import { ThreadMessage } from "../services/mymmo-thread-service/apiThreads";

export interface UseChatMessagesResult {
  messages: ThreadMessage[];
  readMessages: ThreadMessage[];
  unreadMessages: ThreadMessage[];
  isLoading: boolean;
  error: string | null;

  // Message actions
  sendMessage: (text: string) => Promise<boolean>;
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
