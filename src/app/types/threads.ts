// src/app/types/threads.ts - UPDATED WITH TOGGLE SUPPORT

import { ApiResponseWrapper } from "./apiEndpoints";

// ===== THREAD INTERFACES =====
export interface ThreadFollower {
  person_id: number;
  following: boolean;
  last_accessed: string;
  _id: string;
  firstName: string;
  profilePic: string | null;
  lastName: string;
}

export interface ThreadMessage {
  _id: string;
  text: string;
  attachments: any[];
  thread_id: string;
  lang_id_detected: string;
  metadata: {
    recipients: number[];
  };
  is_deleted: boolean;
  created_by: number;
  created_on: string;
  updated_on: string;
  updated_by: number | null;
  __v: number;
  first_message: boolean;
  firstname: string;
}

export interface CommunicationGroup {
  id: number | null;
  translation_name: Record<string, any>;
  group_name: string | null;
}

export interface Thread {
  _id: string;
  thread_status: number;
  followers: ThreadFollower[];
  created_by: number;
  created_on: string;
  unread_message: ThreadMessage;
  dot: boolean;
  latest_message: ThreadMessage;
  unread_count: number;
  communication_group: CommunicationGroup;
}

// ===== API PAYLOADS =====
export interface GetThreadsPayload {
  zoneId: number;
  personId: number;
  type: "active" | "archive";
  transLangId: string;
  offset?: number; // required when type is archive
}

export interface GetThreadsResponse {
  data: Thread[];
}

// ===== COMPONENT PROPS =====
export interface ThreadCardProps {
  thread: Thread;
  currentPersonId: number;
  onClick?: (threadId: string) => void;
  isHighlighted?: boolean; // Add highlighting support
}

export interface ThreadsListProps {
  threads: Thread[];
  currentPersonId: number;
  isLoading: boolean;
  onThreadClick?: (threadId: string) => void;
  highlightThreadId?: string | null; // Add highlighting support
  showAllConversation?: boolean; // 🆕 NEW: Add toggle support for filtering
}
