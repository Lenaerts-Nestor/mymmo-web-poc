# Chat Image Upload Implementation Task

## <� **MAIN REQUEST**

Fix chat image uploads so that when user [925] sends images to user [1325], the receiver sees the actual images instead of blank squares.

## =

**CURRENT PROBLEM**

-  **Receiving images works**: Images from user [1325] display correctly with CloudFront URLs like:
  `https://d25duhkm64s16s.cloudfront.net/uploads/originals/1375-1753367955898.jpg`
- L **Sending images fails**: User [925]'s images show as blank squares with `about:blank` URLs
- L **Loading states**: Images get stuck showing "Verzenden..." (sending...)
- L **Duplicate messages**: Sometimes text appears twice when sending images

## =� **WHAT HAS BEEN FIXED (Ready to Use)**

1.  **Socket message handling** - Now properly passes attachments through WebSocket
2.  **Message format** - Backend expects `fileType` (not `file_type`) - already corrected
3.  **Optimistic message updates** - Fixed stuck loading states
4.  **Duplicate text issue** - Images and text now sent together in one message
5.  **Upload service structure** - Ready to implement AWS upload pattern

## =� **MISSING REQUIREMENT**

**Need environment variable:** `AWS_API_GATEWAY_END_POINT`

## =� **IMPLEMENTATION PLAN**

### **Step 1: Get Environment Variable**

Request from senior developer: `AWS_API_GATEWAY_END_POINT` value

### **Step 2: Update Image Upload Service**

File: `src/app/services/imageUploadService.ts`

**Pattern found in `mobile-temp/editProfilePicture.tsx` (lines 135-147):**

```typescript
const response = await fetch(AWS_API_GATEWAY_END_POINT, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    imageUrl: base64Image, // Base64 string (no data:image prefix)
    personId: userDetails?.userId, // Current user ID
  }),
});

const result = await response.json();
// Response format: { imageUrls: [{ url: "https://cloudfront-url..." }] }
```

### **Step 3: Environment Configuration**

Add to `.env.local`:

```
AWS_API_GATEWAY_END_POINT=https://your-api-gateway-url.com/upload
```

## =' **TECHNICAL DETAILS**

### **Current File Upload Flow:**

1. User selects images in chat
2. Files converted to base64
3. **[MISSING]** Upload to AWS API Gateway
4. **[MISSING]** Receive CloudFront URLs
5. Send message with CloudFront URLs as attachments

### **Expected Attachment Format (Backend Ready):**

```javascript
{
  source: "https://d25duhkm64s16s.cloudfront.net/uploads/originals/xxx.jpg",
  fileType: "image/jpeg",
  type: "image",
  name: "filename.jpg",
  size: 12345
}
```

### **Files Modified (Ready for AWS Integration):**

- `src/app/services/imageUploadService.ts` - Upload logic prepared
- `src/app/contexts/socket/SocketProvider.tsx` - Attachments parameter added
- `src/app/types/socket.ts` - Type definitions updated
- `src/app/hooks/chat/useChatHandlers.ts` - Image processing ready
- `src/app/hooks/chat/useOptimisticMessages.ts` - Loading states fixed

## =� **IMMEDIATE NEXT STEP**

Once `AWS_API_GATEWAY_END_POINT` is provided, uncomment and update the upload logic in `imageUploadService.ts` (lines 22-68 are commented out and ready).

## <� **SUCCESS CRITERIA**

-  User [925] sends image � no "Verzenden..." stuck state
-  User [1325] receives image � sees actual image (not blank square)
-  Clicking image opens CloudFront URL (not `about:blank`)
-  Images and text sent together (no duplicate messages)

---

**Status**: 90% complete - only missing AWS endpoint configuration
