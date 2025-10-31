# Connection Flow Documentation

## Overview
This document describes the complete connection flow for Networking BudE, including all user actions and system behaviors.

## Connection Statuses

| Status | Description |
|--------|-------------|
| `recommended` | Default status - user hasn't acted on this connection yet |
| `perhaps` | User clicked "Perhaps" - connection moves to end of recommended queue |
| `pending` | User A sent connection request to User B, waiting for response |
| `connected` | Mutual connection - both users clicked Connect |
| `saved` | Legacy status (being phased out in favor of `connected`) |
| `passed` | User clicked "No Thanks" - will never show again |

## User Actions & Outcomes

### 1. Connect Button Flow

**User A clicks "Connect" on User B:**
1. Modal appears asking User A to add an optional note
2. User A clicks "Send Request"
3. System updates match status to `pending` with `pending_since` timestamp
4. System checks if User B already sent a request to User A:
   - **If YES (Mutual)**: Both matches update to `connected`, both users see each other in "Saved" tab
   - **If NO**: Match stays `pending`, User A sees it in "Pending" tab
5. Email sent to User B via Resend with:
   - User A's name and compatibility score
   - Optional personal message from User A
   - Link to dashboard: `https://app.networkingbude.com/dashboard?viewConnection={userAId}`
6. In-app notification created for User B

**User B receives email and clicks link:**
1. User B logs in and lands on dashboard
2. System can optionally highlight User A's connection card (via query param)
3. User B sees User A in their Recommended connections
4. User B can respond with:
   - **Connect**: Creates mutual connection → both users see each other in "Saved"
   - **Perhaps**: User A stays in User B's queue but at the end
   - **No Thanks**: User A will never appear for User B again

### 2. Perhaps Button Flow

**User clicks "Perhaps":**
1. Match status updates to `perhaps`
2. Connection stays in "Recommended" tab
3. Connection moves to END of recommended queue (shows after all `recommended` status connections)
4. No email is sent
5. Connection will show up again on next visit
6. User can still Connect or pass on No Thanks later

**Purpose**: Allows users to defer a decision without completely passing, keeping options open for future consideration.

### 3. No Thanks Button Flow

**User clicks "No Thanks":**
1. Match status updates to `passed`
2. Connection immediately removed from all views
3. Will NEVER appear in recommendations again
4. No email is sent
5. Permanent action (no undo)

**Purpose**: Clean, permanent way to decline a connection without any further interaction.

### 4. Pending Timeout (7-10 Day Reset)

**Automatic System Behavior:**
- Every time user loads Connections page, system checks for stale pending connections
- Any connection that has been `pending` for 10+ days automatically:
  - Status changes from `pending` → `recommended`
  - `pending_since` timestamp is cleared
  - Moves back into recommended queue
  - User sees it again in "Recommended" tab

**Why 10 days?**
- Gives recipient enough time to respond
- Prevents connections from being stuck in "Pending" indefinitely
- Provides a second chance if recipient missed the first notification

## Database Schema

### Matches Table Columns

```sql
matches (
  id BIGINT PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  matched_user_id BIGINT REFERENCES users(id),
  compatibility_score INTEGER,
  status TEXT, -- 'recommended', 'perhaps', 'pending', 'connected', 'passed'
  pending_since TIMESTAMP WITH TIME ZONE, -- Set when status → 'pending'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## Email Template

**From**: `connections@networkingbude.com`

**Subject**: `{SenderName} wants to connect with you on Networking BudE`

**Content**:
- Sender's name
- Compatibility score badge
- Optional personal message
- "View Profile & Respond" button → Links to dashboard with query param
- Brief explanation of how to respond

## Testing Checklist

- [ ] User A sends connection request to User B
- [ ] Email is delivered to User B
- [ ] User B clicks email link and lands on dashboard
- [ ] User B sees User A in Recommended tab
- [ ] User B clicks Connect → Both users see each other in Saved tab with "Mutual Connection" badge
- [ ] User A clicks Perhaps → Connection moves to end of queue
- [ ] User A clicks No Thanks → Connection disappears permanently
- [ ] Pending connection times out after 10 days and returns to Recommended
- [ ] "No Thanks" connections never reappear

## Future Enhancements

1. **Query Parameter Handling**: Add code to automatically scroll to or highlight the connection when `?viewConnection={id}` is present in URL
2. **Notification System**: Add in-app notification badge when pending connection becomes mutual
3. **Analytics**: Track connection acceptance rates, perhaps→connect conversion, timeout rates
4. **Undo "No Thanks"**: Add admin function to reset passed connections if user requests
5. **Custom Timeout**: Allow users to set their own timeout duration (7, 14, or 30 days)

## Migration Instructions

1. Open Supabase SQL Editor
2. Copy and paste the contents of `supabase_migration_connections.sql`
3. Run the migration
4. Verify columns were added: Check matches table schema
5. Test the reset function: `SELECT reset_stale_pending_connections();`
6. Deploy updated code to production
7. Monitor emails via Resend dashboard

## Support & Troubleshooting

**Email not sending?**
- Check Resend API key in Vercel environment variables
- Verify sender domain is configured in Resend
- Check `/api/sendConnectionEmail` logs

**Timeout not working?**
- Verify `pending_since` column exists and is populated
- Check if query is running: Look at Connections.jsx useEffect
- Manually test: `SELECT * FROM matches WHERE status='pending' AND pending_since < NOW() - INTERVAL '10 days';`

**Perhaps not showing at end?**
- Verify `perhaps` status is in the query `.in('status', ['recommended', 'perhaps', ...])`
- Check array concatenation: `[...recommended, ...perhaps]`
- Test by marking a connection as perhaps and reloading

