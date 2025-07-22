// src/app/contexts/SocketContext.tsx - Main Export File
"use client";

// Re-export everything from the new structure
export { SocketProvider, useSocketContext } from "./socket/SocketProvider";
export type {
  SocketStatus,
  RealtimeMessage,
  SocketContextType,
  SocketProviderProps,
  UseSocketOptions,
} from "../types/socket";
