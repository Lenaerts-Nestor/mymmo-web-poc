# MyMMO Web Application - Socket.IO Implementation Guide

## What is Socket.IO and Why Do We Need It?

Think of Socket.IO as a **telephone system** for your website. Without it, users would be like people trying to communicate by sending letters - they'd have to keep refreshing the page to see if someone replied. With Socket.IO, it's like having a phone call where you can talk and hear responses instantly.

In our MyMMO application, Socket.IO does these important things:

- **Instant messaging**: When User A sends a message, User B sees it immediately (no page refresh needed)
- **Live notifications**: Unread message counters update in real-time
- **Connection management**: Keeps users connected to the right "chat rooms"
- **Offline handling**: Reconnects automatically when internet comes back

## Understanding the Big Picture

Before diving into code, let's understand how Socket.IO works in our app:

1. **The Server Side**: There's a Socket.IO server running at `https://uat.thread-service.mymmo.infanion.com`
2. **The Client Side**: Our web application connects to this server
3. **Rooms**: Think of these as chat rooms - users join specific rooms to receive messages
4. **Events**: Like phone signals - the server sends "ring" events, we send "answer" events

## Step 1: Check Your Backend First (Very Important!)

Before you start coding, you need to understand what your backend expects. This is like learning the language before calling someone in another country.

**What to check on your backend:**

1. **What events does it listen for?** (What "words" does it understand?)
2. **What events does it send back?** (What "responses" will it give you?)
3. **What data format does it expect?** (How should you "speak" to it?)

In our case, the backend listens for events like:

- `join_socket` - "I want to join a chat room"
- `send_thread_message` - "I'm sending a message"
- `fetch_threads` - "Give me the list of conversations"

And it sends back events like:

- `receive_thread_message` - "Here's a new message for you"
- `update_groups` - "Here's updated conversation info"

## Step 2: Set Up Your Environment (The Foundation)

Think of this as setting up your phone number and address book before making calls.

### A. Add Your "Phone Numbers" (Environment Variables)

Create or update your `.env.local` file with these "addresses":

```env
check the image that has been send to maarten.
```

### B. Install the "Phone System" (NPM Packages)

Run these commands in your terminal:

```bash
npm install socket.io-client
npm install @types/socket.io-client  # If using TypeScript
```

This is like installing the phone app on your device.

### C. Create Your "Phone System Structure" (File Organization)

You need to create these files - think of them as different parts of your phone system:

```
src/app/
├── contexts/
│   ├── SocketContext.tsx              # The main "phone directory"
│   └── socket/
│       ├── SocketProvider.tsx         # The "phone service provider"
│       ├── socketEventHandlers.ts     # "Call handlers" (what to do when phone rings)
│       └── socketUtils.ts             # "Phone utilities" (dial, hang up, etc.)
├── types/
│   └── socket.ts                      # "Phone book definitions"
└── hooks/
    ├── chat/
    │   └── useChatMessages.ts          # "Chat-specific phone features"
    └── useSocketRooms.ts               # "Room management features"
```

## Step 3: Understand the Key Concepts (Building Blocks)

### What is a Provider?

Think of a **Provider** as your telephone company. It:

- Sets up the phone connection to your house
- Manages the phone service for your entire family
- Makes sure everyone in the house can use the phone
- Handles problems when the phone line goes down

In our app, the `SocketProvider` does the same thing - it connects to the Socket.IO server and makes that connection available to all your React components.

### What is a Context?

Think of **Context** as the phone system in your house. It:

- Shares the phone connection with every room
- Lets any room make or receive calls
- Keeps track of who's on the phone
- Manages the address book for everyone

In React, Context lets you share the Socket.IO connection with any component that needs it.

### What are Event Handlers?

Think of **Event Handlers** as your personal assistant who answers the phone. They:

- Answer when someone calls ("Oh, it's mom calling!")
- Decide what to do with each type of call ("If it's work, take a message")
- Handle different types of calls differently ("Pizza delivery? Direct them to the kitchen")

In Socket.IO, event handlers listen for different types of messages from the server and decide what to do with each one.

## Complete Implementation

### 1. TypeScript Definitions (`src/app/types/socket.ts`)

```typescript
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
  zone_id?: string;
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
    createdBy: number,
    attachments?: any[]
  ) => Promise<boolean>;
  onMessageReceived: (callback: (message: RealtimeMessage) => void) => void;
  offMessageReceived: (callback: (message: RealtimeMessage) => void) => void;

  // Thread updates
  onThreadUpdate: (callback: (data: any) => void) => void;
  offThreadUpdate: (callback: (data: any) => void) => void;

  // Inbox updates (for unread counters)
  onInboxUpdate: (callback: (data: any) => void) => void;
  offInboxUpdate: (callback: (data: any) => void) => void;

  // Zone management
  initializeZones: (zones: any[]) => void;
  userZones: any[];
}

// Socket provider props
export interface SocketProviderProps {
  children: React.ReactNode;
  personId?: number;
  enabled?: boolean;
}
```

### 2. Socket Utilities (`src/app/contexts/socket/socketUtils.ts`)

```typescript
import io from "socket.io-client";

export function createSocketConnection(socketUrl: string, personId: number) {
  const socket = io(socketUrl, {
    transports: ["websocket", "polling"],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    forceNew: true,
  });

  // Add heartbeat to keep connection alive
  socket.on("connect", () => {
    console.log("🔌 Socket connected, starting heartbeat");
    const heartbeat = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping");
      } else {
        clearInterval(heartbeat);
      }
    }, 30000); // Ping every 30 seconds

    socket.on("disconnect", () => {
      clearInterval(heartbeat);
    });
  });

  return socket;
}

export function joinSocketRoom(
  socket: ReturnType<typeof io>,
  roomId: string,
  personId: number
) {
  // Join as new version (zone-based)
  socket.emit("join_socket", {
    roomId,
    userId: personId,
    personId: personId,
    appName: "Mymmo-mobile-app-v2",
  });

  // ALSO join as old version for compatibility
  socket.emit("join_socket", {
    roomId: personId.toString(), // Personal room
    userId: personId,
    personId: personId,
    // No appName = old version
  });
}

export function leaveSocketRoom(
  socket: ReturnType<typeof io>,
  roomId: string,
  personId: number
) {
  socket.emit("leave_socket", {
    roomId,
    userId: personId,
  });
}
```

### 3. Socket Event Handlers (`src/app/contexts/socket/socketEventHandlers.ts`)

```typescript
import { RealtimeMessage, SocketStatus } from "../../types/socket";
import { joinSocketRoom } from "./socketUtils";

// Connection handlers
export function setupConnectionHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  personId: number,
  currentRooms: React.MutableRefObject<Set<string>>,
  setStatus: React.Dispatch<React.SetStateAction<SocketStatus>>,
  setLastError: React.Dispatch<React.SetStateAction<string | null>>,
  reconnectAttempts: React.MutableRefObject<number>
) {
  socket.on("connect", () => {
    setStatus("connected");
    setLastError(null);
    reconnectAttempts.current = 0;

    // Auto-join person room
    joinSocketRoom(socket, personId.toString(), personId);

    // Rejoin all rooms
    currentRooms.current.forEach((roomId) => {
      joinSocketRoom(socket, roomId, personId);
    });
  });

  socket.on("disconnect", (reason: string) => {
    setStatus("disconnected");
    if (reason === "io server disconnect") {
      setLastError("Server disconnected");
    } else {
      setStatus("reconnecting");
    }
  });

  socket.on("connect_error", (error: Error) => {
    console.error("Socket connection error:", error.message);
    setStatus("error");
    setLastError(error.message);
  });
}

// Message handlers
export function setupMessageHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  messageCallbacks: React.MutableRefObject<
    Set<(message: RealtimeMessage) => void>
  >
) {
  const handleRealtimeMessage = (data: any) => {
    const message: RealtimeMessage = {
      _id: data._id || `temp-${crypto.randomUUID()}`,
      text: data.text || "",
      created_on: data.created_on || new Date().toISOString(),
      created_by: data.created_by || 0,
      thread_id: data.thread_id || "",
      attachments: data.attachments || [],
      isOptimistic: false,
      zone_id: data.zone_id,
    };

    messageCallbacks.current.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("Error in message callback:", error);
      }
    });
  };

  // Listen to multiple message events
  socket.on("receive_thread_message", handleRealtimeMessage);
  socket.on("thread_message_broadcasted", handleRealtimeMessage);
  socket.on("update_thread_screen", handleRealtimeMessage);

  return () => {
    socket.off("receive_thread_message", handleRealtimeMessage);
    socket.off("thread_message_broadcasted", handleRealtimeMessage);
    socket.off("update_thread_screen", handleRealtimeMessage);
  };
}

// Inbox update handlers (for unread counters)
export function setupInboxUpdateHandlers(
  socket: ReturnType<typeof import("socket.io-client").io>,
  inboxUpdateCallbacks: React.MutableRefObject<Set<(data: any) => void>>
) {
  const handleInboxUpdate = (data: any) => {
    inboxUpdateCallbacks.current.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error in inbox update callback:", error);
      }
    });
  };

  // Listen to thread list updates
  socket.on("update_groups", handleInboxUpdate);
  socket.on("thread_list_updated", handleInboxUpdate);

  // Handle new messages for unread counts
  const handleNewMessageForInbox = (data: any) => {
    if (data.created_by !== parseInt(data.personId || "0")) {
      handleInboxUpdate({
        type: "new_message",
        thread_id: data.thread_id,
        zone_id: data.zone_id,
        message: data,
      });
    }
  };

  socket.on("receive_thread_message", handleNewMessageForInbox);
  socket.on("thread_message_broadcasted", handleNewMessageForInbox);

  return () => {
    socket.off("update_groups", handleInboxUpdate);
    socket.off("thread_list_updated", handleInboxUpdate);
    socket.off("receive_thread_message", handleNewMessageForInbox);
    socket.off("thread_message_broadcasted", handleNewMessageForInbox);
  };
}
```

### 4. Main Socket Provider (`src/app/contexts/socket/SocketProvider.tsx`)

```typescript
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  SocketContextType,
  SocketProviderProps,
  SocketStatus,
  RealtimeMessage,
} from "../../types/socket";
import {
  createSocketConnection,
  joinSocketRoom,
  leaveSocketRoom,
} from "./socketUtils";
import {
  setupConnectionHandlers,
  setupMessageHandlers,
  setupInboxUpdateHandlers,
} from "./socketEventHandlers";

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({
  children,
  personId,
  enabled = true,
}: SocketProviderProps) {
  const [socket, setSocket] = useState<ReturnType<
    typeof import("socket.io-client").io
  > | null>(null);
  const [status, setStatus] = useState<SocketStatus>("disconnected");
  const [lastError, setLastError] = useState<string | null>(null);
  const [userZones, setUserZones] = useState<any[]>([]);

  const currentRooms = useRef<Set<string>>(new Set());
  const reconnectAttempts = useRef(0);
  const messageCallbacks = useRef<Set<(message: RealtimeMessage) => void>>(
    new Set()
  );
  const threadUpdateCallbacks = useRef<Set<(data: any) => void>>(new Set());
  const inboxUpdateCallbacks = useRef<Set<(data: any) => void>>(new Set());

  // Initialize socket connection
  useEffect(() => {
    if (!enabled || !personId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setStatus("disconnected");
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketUrl) {
      console.error("NEXT_PUBLIC_SOCKET_URL not configured");
      setStatus("error");
      setLastError("Socket URL not configured");
      return;
    }

    setStatus("connecting");
    const newSocket = createSocketConnection(socketUrl, personId);

    // Setup all event handlers
    setupConnectionHandlers(
      newSocket,
      personId,
      currentRooms,
      setStatus,
      setLastError,
      reconnectAttempts
    );

    const cleanupMessages = setupMessageHandlers(newSocket, messageCallbacks);
    const cleanupInbox = setupInboxUpdateHandlers(
      newSocket,
      inboxUpdateCallbacks
    );

    setSocket(newSocket);

    return () => {
      cleanupMessages();
      cleanupInbox();
      currentRooms.current.clear();
      newSocket.disconnect();
      setSocket(null);
      setStatus("disconnected");
    };
  }, [enabled, personId]);

  // Initialize zones and join rooms
  const initializeZones = useCallback(
    (zones: any[], translationLang: string = "nl") => {
      if (!socket || !personId || status !== "connected") return;

      setUserZones(zones);

      // Join zone rooms
      zones.forEach((zone) => {
        joinSocketRoom(socket, zone.zoneId.toString(), personId);
        currentRooms.current.add(zone.zoneId.toString());
      });

      // Fetch initial threads for each zone
      zones.forEach((zone) => {
        socket.emit("fetch_threads", {
          zoneId: zone.zoneId,
          personId: personId,
          type: "active",
          transLangId: translationLang,
        });
      });
    },
    [socket, personId, status]
  );

  // Join thread room
  const joinThreadRoom = useCallback(
    (threadId: string, zoneId: string) => {
      if (!socket || !personId || status !== "connected") return;

      joinSocketRoom(socket, threadId, personId);
      joinSocketRoom(socket, zoneId, personId);

      currentRooms.current.add(threadId);
      currentRooms.current.add(zoneId);
    },
    [socket, personId, status]
  );

  // Send message
  const sendMessage = useCallback(
    async (
      threadId: string,
      text: string,
      createdBy: number,
      attachments?: any[]
    ): Promise<boolean> => {
      if (!socket || status !== "connected") return false;

      try {
        socket.emit("send_thread_message", {
          threadId,
          text,
          createdBy,
          completed: false,
          attachments: attachments || [],
          appName: "Mymmo-mobile-app-v2",
        });

        // Trigger immediate inbox update
        setTimeout(() => {
          socket.emit("fetch_threads", {
            type: "active",
            personId: createdBy,
            transLangId: "nl",
          });
        }, 500);

        return true;
      } catch (error) {
        console.error("Socket send error:", error);
        return false;
      }
    },
    [socket, status]
  );

  // Callback management
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

  const onInboxUpdate = useCallback((callback: (data: any) => void) => {
    inboxUpdateCallbacks.current.add(callback);
  }, []);

  const offInboxUpdate = useCallback((callback: (data: any) => void) => {
    inboxUpdateCallbacks.current.delete(callback);
  }, []);

  const contextValue: SocketContextType = {
    socket,
    status,
    isConnected: status === "connected",
    lastError,
    joinThreadRoom,
    leaveThreadRoom: () => {}, // Implement if needed
    sendMessage,
    onMessageReceived,
    offMessageReceived,
    onThreadUpdate: () => {}, // Implement if needed
    offThreadUpdate: () => {}, // Implement if needed
    onInboxUpdate,
    offInboxUpdate,
    initializeZones,
    userZones,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}
```

### 5. Main Export File (`src/app/contexts/SocketContext.tsx`)

```typescript
"use client";

// Re-export everything from the new structure
export { SocketProvider, useSocketContext } from "./socket/SocketProvider";
export type {
  SocketStatus,
  RealtimeMessage,
  SocketContextType,
  SocketProviderProps,
} from "../types/socket";
```

## Step 4: The Essential Socket.IO "Phone Conversations"

Now let's understand the actual conversations you'll have with the server. Think of these as different types of phone calls you can make or receive.

### Messages You Need to Listen For (When the Server "Calls" You)

These are like different types of incoming calls to your phone:

#### 1. Connection Status Calls

```typescript
// "Hello, your phone is now connected!"
socket.on("connect", () => {
  console.log("Great! I'm connected to the server");
  // Now you can make calls and receive messages
});

// "Sorry, your phone got disconnected"
socket.on("disconnect", (reason) => {
  console.log("Connection lost because:", reason);
  // The phone system will try to reconnect automatically
});

// "There's a problem with your phone line"
socket.on("connect_error", (error) => {
  console.log("Connection failed:", error.message);
  // Check your internet or server settings
});
```

#### 2. Incoming Message Calls

```typescript
// "You have a new message!"
socket.on("receive_thread_message", (data) => {
  console.log("New message from user", data.created_by, ":", data.text);
  // Show this message in your chat interface
});

// "This message was sent to everyone in the room"
socket.on("thread_message_broadcasted", (data) => {
  console.log("Broadcast message:", data.text);
  // Display this message for all users in the thread
});

// "The chat screen needs an update"
socket.on("update_thread_screen", (data) => {
  console.log("Thread screen update needed");
  // Refresh the chat interface
});
```

#### 3. Conversation List Updates

```typescript
// "Your conversation list has changed"
socket.on("update_groups", (data) => {
  console.log(
    "Conversation list updated with",
    data.threadsData.length,
    "threads"
  );
  // Update unread message counters and conversation list
});

// "One of your conversation threads was updated"
socket.on("thread_list_updated", (data) => {
  console.log("Thread list needs refresh");
  // Refresh the list of conversations
});
```

### Messages You Need to Send (When You "Call" the Server)

These are like different types of calls you make:

#### 1. "I Want to Join a Chat Room"

```typescript
socket.emit("join_socket", {
  roomId: "zone_123", // Which room you want to join
  userId: 925, // Your user ID (like your phone number)
  personId: 925, // Your person ID (like your extension)
  appName: "Mymmo-mobile-app-v2", // Which app you're using (like caller ID)
});
```

Think of this like calling reception to say "Please connect me to conference room 123"

#### 2. "I'm Sending a Message"

```typescript
socket.emit("send_thread_message", {
  threadId: "thread_456", // Which conversation thread
  text: "Hello everyone!", // Your message
  createdBy: 925, // Your user ID
  completed: false, // Message is not completed yet
  attachments: [], // Any files you're sending
  appName: "Mymmo-mobile-app-v2", // Your app identifier
});
```

This is like saying "Please deliver this message to everyone in conversation room 456"

#### 3. "Give Me My Conversation List"

```typescript
socket.emit("fetch_threads", {
  zoneId: 123, // Which zone/area you want threads for
  personId: 925, // Your person ID
  type: "active", // Only active conversations
  transLangId: "nl", // Language preference
});
```

Like calling and asking "Can you tell me all my active conversations in building 123?"

#### 4. "Show Me All Messages in This Conversation"

```typescript
socket.emit("fetch_thread_messages", {
  threadId: "thread_789", // Which conversation
  personId: 925, // Your person ID
  transLangId: "nl", // Language preference
});
```

Like asking "Can you read me all the messages from conversation 789?"

#### 5. "I'm Still Here" (Heartbeat)

```typescript
socket.emit("ping");
```

This is like occasionally saying "Hello, are you still there?" to keep the line open

## Step 5: Understanding the Data Flow

Here's how a typical message sending works (like making a phone call):

1. **User types message** → "I want to call someone"
2. **App calls `socket.emit("send_thread_message")`** → "Dialing the number"
3. **Server receives message** → "Call connected"
4. **Server broadcasts to all users in room** → "Conference call started"
5. **Other users receive `socket.on("receive_thread_message")`** → "Phone rings for everyone"
6. **Apps update their UI** → "Everyone sees the message"

## Step 6: Real-World Example

Let's say User Alice (ID: 925) wants to send "Hello!" to User Bob (ID: 1325) in Zone 123:

```typescript
// Alice's app does this:
socket.emit("send_thread_message", {
  threadId: "alice_bob_conversation",
  text: "Hello!",
  createdBy: 925, // Alice's ID
  completed: false,
  attachments: [],
  appName: "Mymmo-mobile-app-v2",
});

// Bob's app automatically receives this:
socket.on("receive_thread_message", (data) => {
  // data.text = "Hello!"
  // data.created_by = 925 (Alice's ID)
  // data.thread_id = "alice_bob_conversation"

  // Bob's app shows: "Alice says: Hello!"
  showMessageInChat(data);
});
```

This is like Alice calling Bob and saying "Hello!", and Bob's phone automatically answers and displays the message.

## Step 7: Connecting Your React App (Making It All Work Together)

Now let's connect your Socket.IO "phone system" to your React application. Think of this as installing the phone in every room of your house.

### A. Set Up the "Main Phone Line" (Wrap Your App)

First, you need to connect your entire app to the Socket.IO service, like installing the main phone line to your house:

```typescript
// In your AppWrapper or main layout file
import { SocketProvider } from "./contexts/SocketContext";

function AppWrapper({ children }) {
  // Get the current user (like getting their phone number)
  const { user } = useUser();
  const personId = user?.personId
    ? parseInt(user.personId.toString())
    : undefined;
  const socketEnabled = !isLoading && !!personId;

  return (
    // This is like connecting the phone service to your entire house
    <SocketProvider personId={personId} enabled={socketEnabled}>
      {children}
    </SocketProvider>
  );
}
```

**What this does:**

- `SocketProvider` is like the telephone company connecting service to your house
- `personId` is like your phone number - it identifies who you are
- `enabled` decides whether to turn on phone service (only when user is logged in)

### B. Use the Phone in Any Room (Components)

Now any component in your app can use the "phone" to make calls or receive messages:

```typescript
// In any component that needs real-time chat
import { useSocketContext } from "../contexts/SocketContext";

function ChatComponent() {
  // This is like picking up the phone in any room
  const {
    isConnected, // "Is the phone line working?"
    sendMessage, // "Make a call to send a message"
    onMessageReceived, // "Answer when someone calls"
    offMessageReceived, // "Stop answering calls"
    joinThreadRoom, // "Join a conference call room"
  } = useSocketContext();

  useEffect(() => {
    // Step 1: Join the chat room (like joining a conference call)
    joinThreadRoom("thread_123", "zone_456");

    // Step 2: Set up a "secretary" to handle incoming calls
    const handleMessage = (message) => {
      console.log("New message arrived:", message);
      // Show this message in your chat interface
      addMessageToChat(message);
    };

    // Step 3: Tell the secretary to start answering calls
    onMessageReceived(handleMessage);

    // Step 4: When component unmounts, tell secretary to stop
    return () => {
      offMessageReceived(handleMessage);
    };
  }, []);

  // Function to send a message (like making a phone call)
  const handleSendMessage = async () => {
    const success = await sendMessage(
      "thread_123", // Which conversation
      "Hello world!", // What to say
      925, // Your user ID
      [] // Any files to attach
    );

    if (success) {
      console.log("Message delivered successfully!");
    } else {
      console.log("Message failed to send");
    }
  };

  return (
    <div>
      {/* Show connection status like a phone indicator light */}
      <div>
        Phone Status: {isConnected ? "📞 Connected" : "📵 Disconnected"}
      </div>

      {/* Button to send a message */}
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
}
```

### C. Set Up Your "Phone Directory" (Initialize Zones)

When your app starts, you need to tell the Socket.IO system which "rooms" (zones) the user should be connected to:

```typescript
// Usually in your main dashboard or zones component
const { initializeZones } = useSocketContext();

useEffect(() => {
  // When you have the user's zones, connect them to all rooms
  if (zones.length > 0) {
    // This is like giving someone keys to all the rooms they can enter
    initializeZones(zones, "nl"); // zones array, language preference
  }
}, [zones]);
```

**What this does:**

- It's like telling the receptionist "User 925 has access to rooms 123, 456, and 789"
- The system automatically joins all these rooms
- Now the user will receive messages from any of these zones

## Data Structures

### Message Data Structure

```typescript
interface MessageData {
  _id: string; // Unique message ID
  text: string; // Message content
  created_on: string; // ISO timestamp
  created_by: number; // Sender's user ID
  thread_id: string; // Thread this message belongs to
  zone_id?: string; // Zone this message belongs to
  attachments?: any[]; // File attachments
  lang_id_detected: string; // Detected language
  metadata: {
    recipients: number[]; // List of recipient IDs
  };
  is_deleted: boolean; // Deletion status
  updated_on: string; // Last update timestamp
  updated_by: number | null; // Last updater ID
}
```

### Thread Data Structure

```typescript
interface ThreadData {
  _id: string; // Thread ID
  zone_id: string; // Zone this thread belongs to
  participants: number[]; // User IDs of participants
  created_on: string; // Creation timestamp
  updated_on: string; // Last update timestamp
  unread_count: number; // Unread messages for current user
  last_message?: {
    // Preview of last message
    text: string;
    created_by: number;
    created_on: string;
  };
}
```

## Troubleshooting: When Things Go Wrong (Common Problems and Solutions)

Think of this section as your "phone repair guide" - when your Socket.IO connection isn't working properly.

### 🚫 Problem 1: "My phone won't connect to the server"

**What you see:** `status: "error"` or `status: "disconnected"`

**What's probably wrong:** Your phone number (server URL) is incorrect or missing

**How to fix it:**

1. Check your `.env.local` file - make sure this line exists:

   ```env
   NEXT_PUBLIC_SOCKET_URL=https://uat.thread-service.mymmo.infanion.com
   ```

2. Restart your development server after adding the environment variable

3. Check in your browser console - you should see connection logs

**Like this:**

```typescript
// Add this to debug connection issues
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
if (!socketUrl) {
  console.error(
    "❌ Missing phone number! Add NEXT_PUBLIC_SOCKET_URL to .env.local"
  );
  return;
}
console.log("📞 Trying to connect to:", socketUrl);
```

### 📵 Problem 2: "I'm not receiving messages from others"

**What you see:** Other people's messages don't appear in your chat

**What's probably wrong:** You're not in the right "chat room"

**How to fix it:**

1. Make sure you joined the room first:

   ```typescript
   // You must join the room BEFORE you can receive messages
   joinThreadRoom("thread_123", "zone_456");
   ```

2. Check if you're listening for messages:

   ```typescript
   useEffect(() => {
     const handleMessage = (message) => {
       console.log("📨 Message received:", message);
     };

     onMessageReceived(handleMessage);

     return () => offMessageReceived(handleMessage);
   }, []);
   ```

3. Open browser console and look for message logs - you should see "📨 Message received" when others send messages

### 🔢 Problem 3: "Unread message counters are stuck"

**What you see:** The red notification badge shows wrong numbers or doesn't update

**What's probably wrong:** Your app isn't listening for counter updates

**How to fix it:**

1. Make sure you're listening to the right event:

   ```typescript
   socket.on("update_groups", (data) => {
     console.log("📊 Counter update:", data.threadsData);
     // Update your unread counters here
   });
   ```

2. After sending a message, ask for fresh counter data:
   ```typescript
   // After successfully sending a message
   socket.emit("fetch_threads", {
     type: "active",
     personId: yourPersonId,
     transLangId: "nl",
   });
   ```

### 👥 Problem 4: "I see the same message multiple times"

**What you see:** Duplicate messages appearing in your chat

**What's probably wrong:** Your app is processing the same message twice

**How to fix it:**

1. Keep track of message IDs to avoid duplicates:

   ```typescript
   const [seenMessages, setSeenMessages] = useState(new Set());

   const handleMessage = (message) => {
     // Check if we already saw this message
     if (seenMessages.has(message._id)) {
       console.log("🚫 Skipping duplicate message:", message._id);
       return; // Don't process it again
     }

     // Add to seen messages
     setSeenMessages((prev) => new Set([...prev, message._id]));

     // Now process the message
     console.log("✅ New message:", message);
     addMessageToChat(message);
   };
   ```

## Testing Your Socket.IO Setup (Making Sure Everything Works)

Think of this as testing your new phone system to make sure all features work.

### 🔍 Test 1: Check if Your Phone Connects

```typescript
function ConnectionTest() {
  const { isConnected, status, lastError } = useSocketContext();

  return (
    <div>
      <h3>📞 Connection Test</h3>
      <p>Status: {status}</p>
      <p>Connected: {isConnected ? "✅ Yes" : "❌ No"}</p>
      {lastError && <p>Error: {lastError}</p>}

      {/* You should see "Status: connected" and "Connected: ✅ Yes" */}
    </div>
  );
}
```

### 🏠 Test 2: Check if You Can Join Rooms

```typescript
function RoomTest() {
  const { joinThreadRoom } = useSocketContext();

  const testJoinRoom = () => {
    console.log("🚪 Trying to join test room...");
    joinThreadRoom("test_thread_123", "test_zone_456");
    console.log("✅ Room join attempted");
  };

  return (
    <button onClick={testJoinRoom}>Test Room Joining</button>
    // Check browser console for logs
  );
}
```

### 📤 Test 3: Check if You Can Send Messages

```typescript
function SendTest() {
  const { sendMessage } = useSocketContext();

  const testSendMessage = async () => {
    console.log("📤 Trying to send test message...");

    const success = await sendMessage(
      "test_thread_123",
      "Hello from test!",
      925, // Your user ID
      [] // No attachments
    );

    if (success) {
      console.log("✅ Message sent successfully!");
    } else {
      console.log("❌ Message failed to send");
    }
  };

  return <button onClick={testSendMessage}>Test Send Message</button>;
}
```

### 📥 Test 4: Check if You Can Receive Messages

```typescript
function ReceiveTest() {
  const { onMessageReceived, offMessageReceived } = useSocketContext();
  const [receivedMessages, setReceivedMessages] = useState([]);

  useEffect(() => {
    const handleTestMessage = (message) => {
      console.log("📥 Received test message:", message);
      setReceivedMessages((prev) => [...prev, message]);
    };

    onMessageReceived(handleTestMessage);

    return () => offMessageReceived(handleTestMessage);
  }, []);

  return (
    <div>
      <h3>📥 Message Receive Test</h3>
      <p>Received {receivedMessages.length} messages</p>
      {receivedMessages.map((msg) => (
        <div key={msg._id}>
          From user {msg.created_by}: {msg.text}
        </div>
      ))}
    </div>
  );
}
```

## Quick Debugging Checklist

When Socket.IO isn't working, check these things in order:

### ✅ Step 1: Environment Check

- [ ] `NEXT_PUBLIC_SOCKET_URL` is in your `.env.local` file
- [ ] You restarted your development server after adding it
- [ ] The URL is correct (no typos)

### ✅ Step 2: Connection Check

- [ ] Browser console shows "🔌 Socket connected"
- [ ] `isConnected` returns `true`
- [ ] No error messages in console

### ✅ Step 3: Room Check

- [ ] You called `joinThreadRoom()` before trying to receive messages
- [ ] You're using the correct room IDs (thread ID and zone ID)

### ✅ Step 4: Message Check

- [ ] You're listening with `onMessageReceived()`
- [ ] You're sending with the correct data format
- [ ] No duplicate message handling issues

### ✅ Step 5: Data Check

- [ ] Your user ID (`personId`) is correct
- [ ] Thread IDs and zone IDs are correct
- [ ] Message data includes all required fields

If all these check out and it's still not working, check your backend server - it might be down or have different event names than expected!

## Summary: What You Need to Copy

To implement this Socket.IO system in your own project, you need:

1. **Environment Variables**: `NEXT_PUBLIC_SOCKET_URL`
2. **NPM Package**: `socket.io-client`
3. **File Structure**: 5 main files (types, utils, handlers, provider, export)
4. **Essential Events**: 6 emit events, 8 listen events
5. **React Integration**: Wrap app with provider, use hooks in components

The key Socket.IO events are:

- **join_socket** → Join rooms for real-time updates
- **send_thread_message** → Send messages
- **fetch_threads** → Get thread lists and unread counts
- **receive_thread_message** → Listen for incoming messages
- **update_groups** → Listen for unread counter updates

This implementation provides a complete real-time messaging system with automatic reconnection, room management, and unread counter updates.
