// src/app/contexts/UnifiedAppContext.tsx - FIXED HYDRATION BLOCKING
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import io from "socket.io-client";
import { SessionData } from "../types/ouath/session";
import SessionService from "../services/sessionService";
import { SocketStatus, RealtimeMessage } from "../types/socket";

// ===== UNIFIED STATE TYPES =====
interface UnifiedAppState {
  // User State
  user: SessionData | null;
  isUserLoading: boolean;
  userError: string | null;

  // Socket State
  socket: ReturnType<typeof io> | null;
  socketStatus: SocketStatus;
  isSocketConnected: boolean;
  socketError: string | null;

  // Real-time Counters
  globalUnreadCount: number;
  zoneUnreadCounts: Map<number, number>;
  lastCounterUpdate: Date;

  // Hydration Safety
  isHydrated: boolean;
}

interface UnifiedAppActions {
  // User Actions
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;

  // Socket Actions
  joinThreadRoom: (threadId: string, zoneId: string) => void;
  leaveThreadRoom: (threadId: string, zoneId: string) => void;
  sendMessage: (
    threadId: string,
    text: string,
    createdBy: number
  ) => Promise<boolean>;

  // Counter Actions
  updateZoneUnreadCount: (zoneId: number, count: number) => void;
  incrementGlobalCount: () => void;
  decrementGlobalCount: () => void;
  refreshAllCounters: () => Promise<void>;

  // Message Callbacks
  onMessageReceived: (callback: (message: RealtimeMessage) => void) => void;
  offMessageReceived: (callback: (message: RealtimeMessage) => void) => void;
}

type UnifiedAppContextType = UnifiedAppState & UnifiedAppActions;

const UnifiedAppContext = createContext<UnifiedAppContextType | null>(null);

// ===== PROVIDER IMPLEMENTATION =====
interface UnifiedAppProviderProps {
  children: React.ReactNode;
  enableSocket?: boolean;
}

export function UnifiedAppProvider({
  children,
  enableSocket = true,
}: UnifiedAppProviderProps) {
  const queryClient = useQueryClient();

  // ===== HYDRATION SAFETY =====
  const [isHydrated, setIsHydrated] = useState(false);
  const isMounted = useRef(false);

  // ===== STATE =====
  const [user, setUser] = useState<SessionData | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [socketStatus, setSocketStatus] =
    useState<SocketStatus>("disconnected");
  const [socketError, setSocketError] = useState<string | null>(null);

  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  const [zoneUnreadCounts, setZoneUnreadCounts] = useState<Map<number, number>>(
    new Map()
  );
  const [lastCounterUpdate, setLastCounterUpdate] = useState(new Date());

  // ===== REFS =====
  const currentRooms = useRef<Set<string>>(new Set());
  const messageCallbacks = useRef<Set<(message: RealtimeMessage) => void>>(
    new Set()
  );
  const reconnectAttempts = useRef(0);

  // ===== HYDRATION SAFETY EFFECT =====
  useEffect(() => {
    isMounted.current = true;
    setIsHydrated(true);

    return () => {
      isMounted.current = false;
    };
  }, []);

  // ===== USER MANAGEMENT =====
  const fetchUser = useCallback(async () => {
    // Don't fetch on server, but allow fetching before hydration is complete
    if (typeof window === "undefined") return;

    try {
      setIsUserLoading(true);
      setUserError(null);

      const sessionData = await SessionService.getSession();

      // Only update if still mounted
      if (isMounted.current) {
        setUser(sessionData);
      }
    } catch (err) {
      if (isMounted.current) {
        setUserError("Failed to fetch user session");
        console.error("User context error:", err);
        setUser(null);
      }
    } finally {
      if (isMounted.current) {
        setIsUserLoading(false);
      }
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      // Disconnect socket first
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setSocketStatus("disconnected");
      }

      await SessionService.logout();

      if (isMounted.current) {
        setUser(null);
        setGlobalUnreadCount(0);
        setZoneUnreadCounts(new Map());
      }

      // Clear all React Query caches
      queryClient.clear();
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [socket, queryClient]);

  // ===== SOCKET MANAGEMENT =====
  const initializeSocket = useCallback(
    (personId: number) => {
      // Prevent socket initialization on server
      if (typeof window === "undefined" || !isMounted.current) {
        return;
      }

      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
      if (!socketUrl) {
        console.error("Socket URL not configured");
        if (isMounted.current) {
          setSocketError("Socket URL not configured");
        }
        return;
      }

      if (isMounted.current) {
        setSocketStatus("connecting");
      }

      const newSocket = io(socketUrl, {
        transports: ["polling"], // Only use HTTP polling, not websockets
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // ===== CONNECTION EVENTS =====
      newSocket.on("connect", () => {
        if (!isMounted.current) return;

        setSocketStatus("connected");
        setSocketError(null);
        reconnectAttempts.current = 0;

        // Join user room
        newSocket.emit("join_socket", {
          roomId: personId.toString(),
          userId: personId,
          appName: "Mymmo-mobile-app-v2",
        });

        // Rejoin existing rooms
        currentRooms.current.forEach((roomId) => {
          newSocket.emit("join_socket", {
            roomId,
            userId: personId,
            appName: "Mymmo-mobile-app-v2",
          });
        });
      });

      newSocket.on("disconnect", () => {
        if (isMounted.current) {
          setSocketStatus("disconnected");
        }
      });

      newSocket.on("connect_error", (error: Error) => {
        console.error("Socket connection error:", error);
        if (isMounted.current) {
          setSocketStatus("error");
          setSocketError(error.message);
        }
      });

      // ===== MESSAGE EVENTS =====
      const handleRealtimeMessage = (data: any) => {
        if (!isMounted.current) return;

        const message: RealtimeMessage = {
          _id: data._id || `temp-${Date.now()}`,
          text: data.text || "",
          created_on: data.created_on || new Date().toISOString(),
          created_by: data.created_by || 0,
          thread_id: data.thread_id || "",
          attachments: data.attachments || [],
        };

        // Update global counter
        setGlobalUnreadCount((prev) => prev + 1);
        setLastCounterUpdate(new Date());

        // Notify callbacks
        messageCallbacks.current.forEach((callback) => {
          try {
            callback(message);
          } catch (error) {
            console.error("Message callback error:", error);
          }
        });

        // Smart cache invalidation - only invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: ["threadDetails", data.thread_id],
          exact: false,
        });
      };

      // ===== COUNTER EVENTS =====
      const handleUnreadCountUpdate = (data: {
        zoneId: number;
        unreadCount: number;
      }) => {
        if (!isMounted.current) return;

        setZoneUnreadCounts((prev) => {
          const newCounts = new Map(prev);
          const oldCount = newCounts.get(data.zoneId) || 0;
          const difference = data.unreadCount - oldCount;

          newCounts.set(data.zoneId, data.unreadCount);

          // Update global counter
          setGlobalUnreadCount((prevGlobal) =>
            Math.max(0, prevGlobal + difference)
          );
          setLastCounterUpdate(new Date());

          return newCounts;
        });
      };

      newSocket.on("receive_thread_message", handleRealtimeMessage);
      newSocket.on("thread_message_broadcasted", handleRealtimeMessage);
      newSocket.on("zone_unread_update", handleUnreadCountUpdate);
      newSocket.on("unread_count_update", handleUnreadCountUpdate);

      if (isMounted.current) {
        setSocket(newSocket);
      }

      return () => {
        newSocket.off("receive_thread_message", handleRealtimeMessage);
        newSocket.off("thread_message_broadcasted", handleRealtimeMessage);
        newSocket.off("zone_unread_update", handleUnreadCountUpdate);
        newSocket.off("unread_count_update", handleUnreadCountUpdate);
        newSocket.disconnect();
      };
    },
    [queryClient]
  );

  // Initialize socket when user is available (don't wait for hydration)
  useEffect(() => {
    console.log("🔌 [SOCKET_INIT] Checking initialization:", {
      user: !!user,
      enableSocket,
      socket: !!socket,
      socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
    });

    if (user && enableSocket && !socket) {
      console.log(
        "🔌 [SOCKET_INIT] Starting socket initialization for person:",
        user.personId
      );
      const personId = parseInt(user.personId);
      const cleanup = initializeSocket(personId);
      return cleanup;
    }
  }, [user?.personId, enableSocket]); // Simplified dependency array

  // Initialize user immediately when component mounts (don't wait for hydration)
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ===== SOCKET ACTIONS =====
  const joinThreadRoom = useCallback(
    (threadId: string, zoneId: string) => {
      if (!socket || socketStatus !== "connected" || !user) return;

      const personId = parseInt(user.personId);

      [threadId, zoneId].forEach((roomId) => {
        socket.emit("join_socket", {
          roomId,
          userId: personId,
          appName: "Mymmo-mobile-app-v2",
        });
        currentRooms.current.add(roomId);
      });
    },
    [socket, socketStatus, user]
  );

  const leaveThreadRoom = useCallback(
    (threadId: string, zoneId: string) => {
      if (!socket || !user) return;

      const personId = parseInt(user.personId);

      [threadId, zoneId].forEach((roomId) => {
        socket.emit("leave_socket", {
          roomId,
          userId: personId,
        });
        currentRooms.current.delete(roomId);
      });
    },
    [socket, user]
  );

  const sendMessage = useCallback(
    async (
      threadId: string,
      text: string,
      createdBy: number
    ): Promise<boolean> => {
      if (!socket || socketStatus !== "connected") return false;

      try {
        socket.emit("send_thread_message", {
          threadId,
          text,
          createdBy,
          completed: false,
          attachments: [],
          appName: "Mymmo-mobile-app-v2",
        });

        return true;
      } catch (error) {
        console.error("Socket send error:", error);
        return false;
      }
    },
    [socket, socketStatus]
  );

  // ===== COUNTER ACTIONS =====
  const updateZoneUnreadCount = useCallback((zoneId: number, count: number) => {
    if (!isMounted.current) return;

    setZoneUnreadCounts((prev) => {
      const newCounts = new Map(prev);
      const oldCount = newCounts.get(zoneId) || 0;
      const difference = count - oldCount;

      newCounts.set(zoneId, count);

      // Update global counter
      setGlobalUnreadCount((prevGlobal) =>
        Math.max(0, prevGlobal + difference)
      );
      setLastCounterUpdate(new Date());

      return newCounts;
    });
  }, []);

  const incrementGlobalCount = useCallback(() => {
    if (isMounted.current) {
      setGlobalUnreadCount((prev) => prev + 1);
      setLastCounterUpdate(new Date());
    }
  }, []);

  const decrementGlobalCount = useCallback(() => {
    if (isMounted.current) {
      setGlobalUnreadCount((prev) => Math.max(0, prev - 1));
      setLastCounterUpdate(new Date());
    }
  }, []);

  const refreshAllCounters = useCallback(async () => {
    // Force refresh all counter-related queries
    queryClient.invalidateQueries({
      queryKey: ["globalUnreadCounter"],
    });
    queryClient.invalidateQueries({
      queryKey: ["zonesWithUnread"],
    });
    queryClient.invalidateQueries({
      queryKey: ["inbox"],
    });
  }, [queryClient]);

  // ===== MESSAGE CALLBACKS =====
  const onMessageReceived = useCallback(
    (callback: (message: RealtimeMessage) => void) => {
      messageCallbacks.current.add(callback);
    },
    []
  );

  const offMessageReceived = useCallback(
    (callback: (message: RealtimeMessage) => void) => {
      messageCallbacks.current.delete(callback);
    },
    []
  );

  // ===== MEMOIZED CONTEXT VALUE =====
  const contextValue = useMemo<UnifiedAppContextType>(
    () => ({
      // State
      user,
      isUserLoading,
      userError,
      socket,
      socketStatus,
      isSocketConnected: socketStatus === "connected",
      socketError,
      globalUnreadCount,
      zoneUnreadCounts,
      lastCounterUpdate,
      isHydrated,

      // Actions
      refreshUser,
      logout,
      joinThreadRoom,
      leaveThreadRoom,
      sendMessage,
      updateZoneUnreadCount,
      incrementGlobalCount,
      decrementGlobalCount,
      refreshAllCounters,
      onMessageReceived,
      offMessageReceived,
    }),
    [
      user,
      isUserLoading,
      userError,
      socket,
      socketStatus,
      socketError,
      globalUnreadCount,
      zoneUnreadCounts,
      lastCounterUpdate,
      isHydrated,
      refreshUser,
      logout,
      joinThreadRoom,
      leaveThreadRoom,
      sendMessage,
      updateZoneUnreadCount,
      incrementGlobalCount,
      decrementGlobalCount,
      refreshAllCounters,
      onMessageReceived,
      offMessageReceived,
    ]
  );

  // ===== FIXED: DON'T BLOCK RENDERING =====
  // Always render the context - hydration state is just a flag
  return (
    <UnifiedAppContext.Provider value={contextValue}>
      {children}
    </UnifiedAppContext.Provider>
  );
}

// ===== HOOK =====
export function useUnifiedApp() {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    throw new Error("useUnifiedApp must be used within UnifiedAppProvider");
  }
  return context;
}

// ===== LEGACY COMPATIBILITY HOOKS =====
export function useUser() {
  const { user, isUserLoading, userError, refreshUser, logout } =
    useUnifiedApp();
  return {
    user,
    isLoading: isUserLoading,
    error: userError,
    refreshUser,
    logout,
    isAuthenticated: !!user,
  };
}

export function useSocketContext() {
  const {
    socket,
    socketStatus,
    isSocketConnected,
    socketError,
    joinThreadRoom,
    leaveThreadRoom,
    sendMessage,
    onMessageReceived,
    offMessageReceived,
  } = useUnifiedApp();

  return {
    socket,
    status: socketStatus,
    isConnected: isSocketConnected,
    lastError: socketError,
    joinThreadRoom,
    leaveThreadRoom,
    sendMessage,
    onMessageReceived,
    offMessageReceived,
    onThreadUpdate: () => {}, // Legacy compatibility
    offThreadUpdate: () => {}, // Legacy compatibility
  };
}

export function useUnreadCounter() {
  const { globalUnreadCount, isUserLoading, refreshAllCounters } =
    useUnifiedApp();
  return {
    totalUnreadCount: globalUnreadCount,
    isLoading: isUserLoading,
    error: null,
    refetch: refreshAllCounters,
  };
}
