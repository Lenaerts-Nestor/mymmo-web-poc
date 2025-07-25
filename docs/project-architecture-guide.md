# MyMMO Web Application - Project Architecture

## Overview

The MyMMO web application is built with **Next.js 15** using the modern **App Router** structure. Think of it as a messaging platform where users can communicate through different zones (locations/properties) and have conversations within those zones.

## Technology Stack

### Core Technologies

- **Next.js 15.3.5**: React framework for web applications
- **React 19**: User interface library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS 4**: Styling framework
- **Socket.IO**: Real-time communication

### Key Libraries

- **@tanstack/react-query**: Data fetching and caching
- **React Hook Form**: Form management
- **Zod**: Data validation
- **Zustand**: State management (if needed)
- **@radix-ui**: Accessible UI components
- **jsonwebtoken**: Authentication tokens

## Project Structure

```
mymmo-web/
├── 📁 src/app/                    # Next.js App Router (main application)
│   ├── 📁 (auth)/                 # Authentication routes (grouped)
│   │   └── 📁 login/
│   │       └── page.tsx           # Login page
│   ├── 📁 (dashboard)/            # Dashboard routes (grouped)
│   │   ├── 📁 conversations/      # Chat/messaging pages
│   │   │   └── [personId]/
│   │   │       └── [zoneId]/
│   │   │           ├── page.tsx   # Conversation list
│   │   │           └── thread/
│   │   │               └── [threadId]/
│   │   │                   └── page.tsx  # Individual chat
│   │   └── 📁 zones/              # Zone management pages
│   │       └── [personId]/
│   │           └── page.tsx       # Zone selection
│   ├── 📁 api/                    # Backend API routes
│   ├── 📁 components/             # Reusable UI components
│   ├── 📁 contexts/               # React Context providers
│   ├── 📁 hooks/                  # Custom React hooks
│   ├── 📁 services/               # API and business logic
│   ├── 📁 types/                  # TypeScript definitions
│   └── 📁 utils/                  # Utility functions
├── 📁 docs/                       # Documentation (this file)
├── 📁 mobile-temp/                # Legacy mobile code (reference)
└── 📁 mymmo-threads/              # Backend thread services (reference)
```

## Application Architecture Layers

### 1. **Presentation Layer** (Components & Pages)

Where users see and interact with the application.

#### Page Structure (Next.js App Router)

```
/ (root)                           → Default Next.js homepage
├── /login                         → User authentication
└── /zones/[personId]              → Zone selection for a person
    └── /conversations/[personId]/[zoneId]  → Chat conversations in a zone
        └── /thread/[threadId]     → Individual chat thread
```

#### Component Organization

```
📁 components/
├── 📁 auth/                       # Authentication components
│   └── ProtectedRoute.tsx         # Route protection wrapper
├── 📁 chat/                       # Chat/messaging components
│   ├── ChatContent.tsx            # Main chat interface
│   ├── ChatInput.tsx              # Message input field
│   ├── MessageBubble.tsx          # Individual message display
│   └── MessagesArea.tsx           # Messages container
├── 📁 conversation/               # Conversation list components
│   ├── ConversationCard.tsx       # Individual conversation item
│   ├── ConversationList.tsx       # List of conversations
│   └── ConversationsContent.tsx   # Main conversations page
├── 📁 layouts/                    # Layout components
│   └── DashboardLayout.tsx        # Main dashboard wrapper
├── 📁 sidebar/                    # Navigation sidebar
│   ├── sidebarNavigation.tsx      # Navigation menu
│   └── sidebarHeader.tsx          # Sidebar header
├── 📁 ui/                         # Basic UI components
│   ├── LoadingSpinner.tsx         # Loading indicator
│   ├── ErrorDisplay.tsx           # Error messages
│   └── ToggleSwitch.tsx           # Switch component
└── 📁 zones/                      # Zone management components
    ├── ZoneCard.tsx               # Individual zone display
    └── ZonesList.tsx              # List of zones
```

### 2. **State Management Layer** (Contexts & Hooks)

How the application manages and shares data between components.

#### Context Providers (Global State)

```
📁 contexts/
├── UserContext.tsx                # User authentication & session
├── ZonesContext.tsx               # Zones data & unread counts
├── SocketContext.tsx              # Real-time WebSocket connection
├── SidebarContext.tsx             # Sidebar open/close state
└── UnreadCounterContext.tsx       # Global unread message counter
```

#### Custom Hooks (Component Logic)

```
📁 hooks/
├── 📁 chat/                       # Chat-related hooks
│   ├── useChatMessages.ts         # Manages chat messages
│   ├── useChatHandlers.ts         # Handles sending messages
│   └── useOptimisticMessages.ts   # Optimistic UI updates
├── 📁 threads/                    # Thread management hooks
│   ├── useThreads.ts              # Fetches conversation threads
│   └── useThreadDetails.ts        # Fetches thread messages
├── useZonesWithUnreadCounts.ts    # Zones with unread counters
└── useGlobalUnreadCounter.ts      # Global unread counter
```

### 3. **Business Logic Layer** (Services)

Where API calls and data processing happen.

#### API Services

```
📁 services/
├── 📁 encryption/                 # Security & API client
│   ├── apiClient.ts               # Main API client with encryption
│   ├── encryptionService.ts       # Data encryption/decryption
│   ├── tokenService.ts            # OAuth token management
│   └── cacheService.ts            # Response caching
├── 📁 mymmo-service/              # Zone & person APIs
│   ├── apiZones.ts                # Zone management endpoints
│   ├── apiPerson.ts               # Person information endpoints
│   └── apiProperties.ts           # Property management
├── 📁 mymmo-thread-service/       # Chat & messaging APIs
│   └── apiThreads.ts              # Thread & message endpoints
├── sessionService.ts              # User session management
└── imageUploadService.ts          # File upload handling
```

### 4. **Data Layer** (Types & API)

Data structures and backend communication.

#### Type Definitions

```
📁 types/
├── 📁 context/                    # Context type definitions
├── 📁 ouath/                      # Authentication types
├── apiEndpoints.ts                # API request/response types
├── chat.ts                        # Chat message types
├── threads.ts                     # Thread conversation types
├── zones.ts                       # Zone location types
└── socket.ts                      # WebSocket event types
```

## Data Flow Architecture

### 1. **Application Initialization**

```
User opens app → AppWrapper → UserContext → SocketContext → ZonesContext
```

### 2. **User Authentication**

```
Login page → SessionService → API call → UserContext updates → Redirect to dashboard
```

### 3. **Loading Zones**

```
Dashboard loads → ZonesContext → apiZones.getZonesByPerson() → Display zones
```

### 4. **Real-time Updates**

```
WebSocket receives message → SocketContext → ZonesContext → Update unread counters
```

### 5. **Opening Conversations**

```
User clicks zone → useThreads hook → apiThreads.getThreads() → Display conversations
```

### 6. **Chat Messaging**

```
User sends message → useChatHandlers → apiThreads.saveMessage() → WebSocket broadcast
```

## Key Architectural Patterns

### 1. **Provider Pattern** (React Context)

Global state is managed through React Context providers:

- **UserContext**: Authentication and user session
- **ZonesContext**: Zones data and unread counts
- **SocketContext**: WebSocket connection and real-time updates

### 2. **Custom Hooks Pattern**

Complex logic is extracted into reusable hooks:

- **Data fetching**: `useThreads`, `useChatMessages`
- **State management**: `useOptimisticMessages`
- **Business logic**: `useChatHandlers`

### 3. **Service Layer Pattern**

API calls are organized into service classes:

- **MyMMOApiZone**: Zone-related endpoints
- **MyMMOApiThreads**: Thread and messaging endpoints
- **ApiClient**: Core API client with encryption

### 4. **Route Groups** (Next.js)

Routes are organized using Next.js route groups:

- **(auth)**: Authentication pages
- **(dashboard)**: Main application pages

### 5. **Component Composition**

Complex components are built by composing smaller components:

- **ConversationsContent** = ConversationsHeader + ConversationList + ConversationsToggle

## Security Architecture

### 1. **Data Encryption**

- All API requests are encrypted using `EncryptionService`
- Responses are automatically decrypted
- Sensitive data never travels in plain text

### 2. **Authentication**

- OAuth token-based authentication
- JWT tokens for session management
- Protected routes using `ProtectedRoute` component

### 3. **Caching Security**

- Intelligent caching with TTL (Time To Live)
- Cache invalidation for write operations
- No sensitive data cached in browser

## Performance Optimizations

### 1. **Smart Caching**

- **Zones**: 8 minutes cache (rarely change)
- **Threads**: 2 seconds cache (real-time feel)
- **Messages**: No cache for writes

### 2. **Real-time Updates**

- WebSocket for instant message delivery
- Optimistic UI updates for better UX
- Automatic cache invalidation

### 3. **Code Splitting**

- Route-based code splitting with Next.js
- Component lazy loading where appropriate

## Development Workflow

### 1. **File Organization**

- **Components**: Organized by feature (chat, zones, conversation)
- **Hooks**: Grouped by functionality
- **Services**: Separated by API domain
- **Types**: Structured by data domain

### 2. **Naming Conventions**

- **Components**: PascalCase (e.g., `ConversationCard`)
- **Hooks**: camelCase starting with "use" (e.g., `useChatMessages`)
- **Services**: PascalCase classes (e.g., `MyMMOApiZone`)
- **Files**: camelCase or kebab-case consistently

### 3. **State Management Strategy**

- **Global state**: React Context for app-wide data
- **Local state**: useState for component-specific data
- **Server state**: React Query for API data caching
- **Form state**: React Hook Form for form management

## Environment Configuration

The application requires these environment variables:

```env
check the image thats been send to maarten.
```

## Deployment Architecture

### 1. **Build Process**

```bash
npm run start  # Starts production server
```

### 2. **File Structure After Build**

- **Static files**: Optimized and cached
- **API routes**: Server-side functions
- **Client components**: Hydrated on client

This architecture provides a scalable, maintainable, and performant foundation for the MyMMO web application, with clear separation of concerns and modern React/Next.js best practices.
