# MyMMO Web Application - API Endpoints Documentation

## Overview

This document explains how the MyMMO web application communicates with backend services. Think of API endpoints as "doors" that allow our web application to ask for information or send data to the server.

The application uses **two main services**:

- **mymmo-service**: Handles zones, persons, and properties
- **mymmo-thread-service**: Handles conversations and messages

## Environment Setup

All API calls require these environment variables in `.env.local`:

```env
check the image that has been send to maarten.
```

## How API Calls Work

### 1. Security Layer

- All data is **encrypted** before sending to the server
- The server sends back **encrypted** responses
- Our application automatically **decrypts** the data
- Uses OAuth tokens for authentication

### 2. Caching System

- Frequently used data is **cached** to make the app faster
- Different endpoints have different cache times:
  - Zones: 8 minutes (they don't change often)
  - Threads: 2 seconds (need real-time updates)
  - Write operations: No cache (always fresh)

## Main API Endpoints

### 🏠 Zone Management (mymmo-service)

#### 1. Get Zones by Person

**What it does**: Gets all zones (locations/properties) for a specific person

**Endpoint**: `/service/mymmo-service/getZonesByPerson`

**Used in files**:

- `src/app/services/mymmo-service/apiZones.ts:21-44`
- `src/app/contexts/ZonesContext.tsx:77-81`
- `src/app/hooks/useZonesWithUnreadCounts.ts:48-52`

**Data flow**:

1. User opens the application
2. `ZonesContext.tsx` calls `MyMMOApiZone.getZonesByPerson()`
3. Sends: `{ personId: 925, userId: 925, langId: "en" }`
4. Receives: List of zones with details
5. Zones are displayed in the sidebar

**Cache**: 8 minutes (zones don't change frequently)

#### 2. Get Zones List (Geographical)

**What it does**: Gets zones based on geographical filters

**Endpoint**: `/service/mymmo-service/getZonesList`

**Used in files**:

- `src/app/services/mymmo-service/apiZones.ts:50-64`

**Cache**: 5 minutes

#### 3. Create Zone

**What it does**: Creates a new zone/property

**Endpoint**: `/service/mymmo-service/createZone`

**Used in files**:

- `src/app/services/mymmo-service/apiZones.ts:92-111`

**Cache**: None (write operation)

### 💬 Thread Management (mymmo-thread-service)

#### 1. Get Threads

**What it does**: Gets all conversation threads for a zone

**Endpoint**: `/service/mymmo-thread-service/getThreads`

**Used in files**:

- `src/app/services/mymmo-thread-service/apiThreads.ts:76-88`
- `src/app/hooks/threads/useThreads.ts`

**Data flow**:

1. User clicks on a zone
2. `useThreads` hook calls `MyMMOApiThreads.getThreads()`
3. Sends: `{ zoneId: "123", personId: 925, transLangId: "en" }`
4. Receives: List of conversation threads
5. Threads are displayed as conversation cards

**Cache**: Smart caching for real-time updates

#### 2. Get Thread Details

**What it does**: Gets all messages in a specific conversation

**Endpoint**: `/service/mymmo-thread-service/getThreadDetails`

**Used in files**:

- `src/app/services/mymmo-thread-service/apiThreads.ts:94-108`
- `src/app/hooks/threads/useThreadDetails.ts`
- `src/app/hooks/chat/useChatMessages.ts`

**Data flow**:

1. User clicks on a conversation
2. `useChatMessages` calls `MyMMOApiThreads.getThreadDetails()`
3. Sends: `{ threadId: "abc123", transLangId: "en", personId: 925 }`
4. Receives: `{ readMessages: [...], unreadMessages: [...] }`
5. Messages are displayed in the chat interface

**Cache**: 2 seconds (for real-time feel)

#### 3. Save Message

**What it does**: Sends a new message to a conversation

**Endpoint**: `/service/mymmo-thread-service/saveMessage`

**Used in files**:

- `src/app/services/mymmo-thread-service/apiThreads.ts:114-135`
- `src/app/hooks/chat/useChatHandlers.ts`

**Data flow**:

1. User types a message and hits send
2. `useChatHandlers` calls `MyMMOApiThreads.saveMessage()`
3. Sends: `{ threadId: "abc123", text: "Hello!", createdBy: 925, completed: true }`
4. Receives: `{ message: "success", messageId: "xyz789" }`
5. Message appears in the chat
6. **Cache clearing**: Automatically clears thread and zone caches for immediate updates

**Cache**: None (write operation)

#### 4. Update Thread Last Access (Mark as Read)

**What it does**: Marks messages as read to update unread counters

**Endpoint**: `/service/mymmo-thread-service/threadLastAccessUpdate`

**Used in files**:

- `src/app/services/mymmo-thread-service/apiThreads.ts:167-220`
- `src/app/hooks/chat/useChatMessages.ts`

**Data flow**:

1. User opens a conversation
2. `useChatMessages` calls `updateThreadLastAccess()`
3. Sends: `{ threadId: "abc123", personId: 925 }`
4. Receives: Success confirmation
5. Unread counter decreases
6. **Fallback logic**: Tries `personId` first, then `personid` if that fails

**Cache**: None (write operation)

## Real-time Updates (WebSocket)

**Socket URL**: `https://uat.thread-service.mymmo.infanion.com`

**Used in files**:

- `src/app/contexts/socket/SocketProvider.tsx`
- `src/app/contexts/SocketContext.tsx`

**What it does**:

- Receives instant notifications for new messages
- Updates unread counters without page refresh
- Handles inbox updates across zones

## Common Data Flow Patterns

### 1. Loading Zones

```
User opens app → ZonesContext → getZonesByPerson → Display zones in sidebar
```

### 2. Opening Conversation

```
User clicks zone → useThreads → getThreads → Display conversation list
User clicks conversation → useChatMessages → getThreadDetails → Display messages
```

### 3. Sending Message

```
User types message → useChatHandlers → saveMessage → Update UI → Clear caches → Socket update
```

### 4. Real-time Message Receiving

```
Socket receives message → Update unread counters → Update conversation list
```

## Error Handling

All API calls include error handling:

- Failed calls show user-friendly messages
- Automatic retry logic for temporary failures
- Cache clearing on errors to ensure fresh data

## File Structure

### API Service Files

- `src/app/services/mymmo-service/apiZones.ts` - Zone endpoints
- `src/app/services/mymmo-thread-service/apiThreads.ts` - Thread endpoints
- `src/app/services/encryption/apiClient.ts` - Core API client with encryption

### Hook Files (How components use APIs)

- `src/app/hooks/useZonesWithUnreadCounts.ts` - Manages zone data
- `src/app/hooks/threads/useThreads.ts` - Manages thread lists
- `src/app/hooks/chat/useChatMessages.ts` - Manages chat messages

### Context Files (Global state)

- `src/app/contexts/ZonesContext.tsx` - Global zones state
- `src/app/contexts/socket/SocketProvider.tsx` - WebSocket management

This documentation provides a complete overview of how data flows through the MyMMO web application, from user interactions to server communication and back to the user interface.
