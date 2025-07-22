// src/app/types/socket.ts - Socket Type Definitions

// Socket connection states
export type SocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

// Real-time message interface
export interface RealtimeMessage {
  _id: string;
  text: string;
  created_on: string;
  created_by: number;
  thread_id: string;
  attachments?: any[];
  isOptimistic?: boolean;
}

// Socket context interface
export interface SocketContextType {
  socket: ReturnType<typeof import("socket.io-client").io> | null;
  status: SocketStatus;
  isConnected: boolean;
  lastError: string | null;

  // Room management
  joinThreadRoom: (threadId: string, zoneId: string) => void;
  leaveThreadRoom: (threadId: string, zoneId: string) => void;

  // Message handling
  sendMessage: (
    threadId: string,
    text: string,
    createdBy: number
  ) => Promise<boolean>;
  onMessageReceived: (callback: (message: RealtimeMessage) => void) => void;
  offMessageReceived: (callback: (message: RealtimeMessage) => void) => void;

  // Thread updates
  onThreadUpdate: (callback: (data: any) => void) => void;
  offThreadUpdate: (callback: (data: any) => void) => void;
}

// Socket provider props
export interface SocketProviderProps {
  children: React.ReactNode;
  personId?: number;
  enabled?: boolean;
}

// Socket hook options
export interface UseSocketOptions {
  threadId?: string;
  personId?: number;
  onMessage?: (data: any) => void;
  onThreadUpdate?: (data: any) => void;
  onError?: (error: string) => void;
}
