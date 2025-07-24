**Current Behavior**

1. Going from **Zones → Conversation → Zones** causes the Zones page to fully reload.
2. Navigating to **Inbox** (page & sidebar) also reloads and is redundant—Zones already shows unread toggles.
3. Every reload refetches all unread zones, so I must wait before seeing which zones are unread.

**Expected Behavior**

- **Zones** should preserve its last state when the user returns (no full reload).
- Unread zone toggles should appear instantly (avoid refetch on each navigation).
- Completely remove the **Inbox** page and sidebar. Unread messages stay indicated in **Zones**.
