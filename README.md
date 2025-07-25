# MyMMO Web - Real-time Chat Application

A Next.js-based real-time chat application for neighborhood communities, featuring Socket.IO integration, image uploads, and conversation management.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- AWS API Gateway endpoint for image uploads

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd mymmo-web
npm install
```

2. **Environment Setup:**
   Create `.env.local` with:

```env
NEXT_PUBLIC_SOCKET_URL=your-socket-server-url
AWS_API_GATEWAY_END_POINT=your-aws-api-gateway-url
```

3. **Run development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Current Status

### ✅ Working Features

- **Real-time messaging** via Socket.IO
- **Zone-based conversations** (neighborhood groups)
- **Message threading** and conversation management
- **Receiving images** from other users (CloudFront URLs)
- **Socket connection management** with auto-reconnection
- **Unread message counts** and inbox updates

### 🔧 In Progress

- **Image uploads** - 90% complete, needs `AWS_API_GATEWAY_END_POINT` configuration
- **Optimistic message updates** - preventing stuck "sending..." states

## 🏗️ Architecture

### Socket Connection

- **Single WebSocket connection** per user
- **Multiple rooms**: personal, zone-based, and thread-specific
- **Event-driven messaging** with real-time updates

### Key Components

```
src/app/
├── contexts/socket/          # Socket.IO management
│   ├── SocketProvider.tsx    # Main socket context
│   ├── handlers/            # Event handlers by category
│   └── socketUtils.ts       # Connection utilities
├── hooks/chat/              # Chat-related hooks
├── services/                # API and upload services
└── types/                   # TypeScript definitions
```

### Socket Events

**Outgoing (app sends):**

- `send_thread_message` - Send new message
- `fetch_threads` - Get conversation updates
- `join_room` / `leave_room` - Room management

**Incoming (app receives):**

- `receive_thread_message` - New message received
- `update_groups` - Inbox/conversation updates
- `thread_list_updated` - Thread changes

## 🖼️ Image Upload Flow

### Current Implementation

1. User selects images in chat
2. Files converted to base64
3. **[PENDING]** Upload to AWS API Gateway
4. **[PENDING]** Receive CloudFront URLs
5. Send message with CloudFront URLs as attachments

### Expected Attachment Format

```javascript
{
  source: "https://d25duhkm64s16s.cloudfront.net/uploads/originals/xxx.jpg",
  fileType: "image/jpeg",
  type: "image",
  name: "filename.jpg",
  size: 12345
}
```

## 🛠️ Development

### Key Files

- `src/app/contexts/socket/SocketProvider.tsx` - Socket connection management
- `src/app/services/imageUploadService.ts` - Image upload logic (ready for AWS)
- `src/app/hooks/chat/useChatHandlers.ts` - Chat interaction logic
- `docs/socket-connection-guide.md` - Socket implementation guide

### Testing Users

- **User 925** - Sender (image uploads show as blank squares)
- **User 1325** - Receiver (receives images correctly)

### Environment Variables

```env
# Required
NEXT_PUBLIC_SOCKET_URL=wss://your-socket-server.com
AWS_API_GATEWAY_END_POINT=https://your-api-gateway.com/upload

# Optional
NEXT_PUBLIC_DEBUG=true
```

## 📚 Documentation

- [Socket Connection Guide](./docs/socket-connection-simple-versie-guide.md) - Simple explanation of WebSocket implementation
- [API Endpoints](./docs/api-endpoints.md) - Backend API documentation
- [Project Architecture](./docs/project-architecture.md) - System overview
- [Socket.IO Implementation](./docs/socket-io-implementation-dieper-guide.md.md) - Technical details

## 🐛 Known Issues

note : ! these issue as image upload arent implemented yet. the error are an explanation to the next developer and why he may see no image or so.

### Session

the session works and the authentications and such works good, there is just a small issue that i cant pin point , that sometimes after loading if we logged in in another account before the current one we are doing.

for less than a split of a second we can see the previous account zones of page. but it shouldnt happend as i clear the session after logging out. maybe it my local repository and slow pc but lets be sure that it works.

### Fast loading of counter.

currently the counter to show unread messages work. but it doesnt update instantly

- for the moment im unaware of why the unreadcounter badge that indiciates that zone card or conversation card badge isnt instantly updating. i implemented the socket.io and yet it takes sometimes 2 seconds or sometimes 30 to 40 seconds. AI is telling me its something from the backend but im not sure as the microservice are a bit complex to understand on the little time i have .

- possible its a problem with the cache, that i implemneted for smooth navigation and such and maybe its stil holding information and not clearing it on time.

- **updating the counter** works but not as fast as it should be desired. i belief its on my code and not the backend.

### Image Upload Problems

- **Sending images fails**: User 925's images show as blank squares
- **Loading states**: Images stuck showing "Verzenden..." (sending...)
- **URL issue**: Images show `about:blank` instead of CloudFront URLs

**Root cause**: Missing AWS API Gateway endpoint configuration

### Fixes Applied

- ✅ Socket message handling with attachments
- ✅ Message format corrected (`fileType` vs `file_type`)
- ✅ Optimistic message updates
- ✅ Duplicate message prevention
- ✅ Upload service structure ready

## 🔧 Quick Fixes

### To Complete Image Uploads

1. Get `AWS_API_GATEWAY_END_POINT` from senior developer
2. Add to `.env.local`
3. Uncomment upload logic in `imageUploadService.ts:22-68`

### Common Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

## 🏃‍♂️ Next Steps

1. **Configure AWS endpoint** for image uploads
2. **Test image upload flow** end-to-end
3. **Performance optimization** for large conversations
4. **Error handling** improvements
5. **Mobile responsiveness** enhancements

---

**Tech Stack**: Next.js 14, TypeScript, Socket.IO, TailwindCSS, AWS S3/CloudFront
