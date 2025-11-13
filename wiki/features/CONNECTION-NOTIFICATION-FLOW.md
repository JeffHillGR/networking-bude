# BudE Connection & Notification System - Process Flow

## Overview
This document outlines the complete connection flow between two users (User A and User B) in the BudE networking app, including notification system requirements and database state management.

---

## Initial State
- **Algorithm Match**: Users A and B are matched by the compatibility algorithm
- **Display**: Both users see each other's full profile cards in their "Recommended" connections
- **Status in Database**: `connections` table has two rows:
  - Row 1: `user_id: A, matched_user_id: B, status: 'recommended'`
  - Row 2: `user_id: B, matched_user_id: A, status: 'recommended'`

---

## User Actions & States

### 1. **CONNECT Action**

#### Scenario: User A clicks "Connect"
1. **User A's View:**
   - Connection moves from "Recommended" tab to "Pending" tab
   - Card still visible but marked as "Waiting for response"
   - Database: `connections` row for A→B changes to `status: 'pending'`

2. **User B's Notification:**
   - Bell icon lights up with red badge showing "1"
   - Notification entry created in `notifications` table:
     ```
     {
       user_id: B,
       from_user_id: A,
       type: 'connection_request',
       message: '[User A Name] wants to connect',
       profile_link: A's user_id,
       read: false,
       dismissed: false,
       created_at: timestamp
     }
     ```

3. **User B's Bell Dropdown:**
   - Shows: **"[User A Name] wants to connect"**
   - Includes link to User A's profile card (already in B's suggested connections)
   - **Cannot be dismissed** - notification persists until B takes action
   - Clicking notification navigates to User A's card in B's Recommended list

4. **User B Takes Action:**

   **Option 1: User B clicks "Connect"**
   - ✅ **MUTUAL CONNECTION ACHIEVED**
   - Both users' `connections` rows update to `status: 'connected'`
   - Both users moved to "Saved" (Connected) tab
   - Notification marked as `read: true`
   - **Success Popup** appears for BOTH users:
     ```
     🎉 You're Connected!
     You and [User Name] are now connected.
     Use email to reach out to your new connection:
     [email@example.com]
     ```

   **Option 2: User B clicks "Perhaps"**
   - User A stays in "Pending" tab (still waiting)
   - User B's match goes to holding state:
     - Database: B→A row gets `status: 'perhaps_holding'`
     - Add field: `reappear_date: current_date + 5 days`
   - Notification marked as `read: true` but stays in system
   - **After 5 days**: B→A automatically returns to `status: 'recommended'`
   - User A is NOT notified that B chose "Perhaps" (they just keep waiting)

   **Option 3: User B clicks "No Thanks"**
   - 🚫 **MUTUAL REJECTION - REMOVE FROM BOTH SIDES**
   - Database updates:
     - A→B row: `status: 'rejected'` or DELETE
     - B→A row: `status: 'rejected'` or DELETE
   - User A's pending connection disappears from Pending tab
   - User B's card disappears from all tabs
   - Neither user will see each other again in suggestions
   - Notification marked as `dismissed: true`

---

### 2. **PERHAPS Action**

#### Scenario: User A clicks "Perhaps"
1. **User A's View:**
   - Connection moves from "Recommended" to "Saved" tab (for later review)
   - Database: A→B changes to `status: 'saved'`
   - Card remains accessible in Saved tab

2. **User B's View:**
   - **NO NOTIFICATION** - B doesn't know A saved them
   - B's view of A remains in "Recommended" (unchanged)
   - Database: B→A stays as `status: 'recommended'`

3. **Later Actions:**
   - User A can go to Saved tab and choose Connect/No Thanks
   - If A clicks Connect from Saved → same flow as #1 above
   - User B can still take action independently at any time

---

### 3. **NO THANKS Action**

#### Scenario: User A clicks "No Thanks"
1. **Immediate Effect:**
   - 🚫 **MUTUAL REJECTION - REMOVE FROM BOTH SIDES**
   - Database updates:
     - A→B row: `status: 'rejected'` or DELETE
     - B→A row: `status: 'rejected'` or DELETE

2. **User A's View:**
   - Card immediately disappears from Recommended
   - Will not see User B again

3. **User B's View:**
   - User A's card disappears from Recommended
   - Will not see User A again
   - **NO NOTIFICATION** - B doesn't know A rejected them

---

## Symmetrical Flow
**Important**: The entire process works identically if User B takes the first action instead of User A. All the same rules apply in reverse.

---

## Database Schema Requirements

### `connections` Table
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  matched_user_id UUID REFERENCES users(id),
  compatibility_score INTEGER,
  status TEXT CHECK (status IN ('recommended', 'pending', 'saved', 'connected', 'rejected', 'perhaps_holding')),
  reappear_date DATE,  -- For "Perhaps" holding state
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, matched_user_id)
);
```

### `notifications` Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),  -- Recipient
  from_user_id UUID REFERENCES users(id),  -- Sender
  type TEXT CHECK (type IN ('connection_request', 'mutual_connection', 'message')),
  message TEXT,
  profile_link UUID,  -- Link to from_user's profile
  read BOOLEAN DEFAULT false,
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Edge Cases & Business Rules

### 1. **Notification Persistence**
- Connection request notifications CANNOT be dismissed without action
- User must choose Connect/Perhaps/No Thanks to clear notification
- Badge count only decreases when notification is marked `read: true`

### 2. **"Perhaps" Holding Period**
- User B clicks "Perhaps" → User A sees no change (still in Pending)
- After 5 days, User B sees User A reappear in Recommended
- User A remains in Pending until B takes Connect or No Thanks action
- If B chooses "Perhaps" again → another 5-day cycle

### 3. **Mutual Rejection Rule**
- If EITHER user clicks "No Thanks" → BOTH lose access to each other
- This is permanent - they will not be matched again
- No notification sent to the rejected party

### 4. **Success Popup Content**
```
🎉 You're Connected!

You and [First Name Last Name] are now connected.

Use email to reach out to your new connection:
[their-email@example.com]

[Close Button]
```

### 5. **Pending State Visibility**
- User A sees connection in "Pending" tab
- User B still sees A in "Recommended" tab (with notification)
- Both can take actions independently until one chooses "No Thanks"

---

## Implementation Checklist for Developer

### Frontend (React)
- [ ] Update Connections component to handle "pending" status
- [ ] Build notification bell dropdown component
- [ ] Create success popup modal for mutual connections
- [ ] Handle "Perhaps" holding state (hide for 5 days)
- [ ] Implement notification click → navigate to profile card
- [ ] Show email in success popup
- [ ] Update tab counts (Recommended/Saved/Pending)

### Backend (Supabase)
- [ ] Update `connections` table schema (add `reappear_date` field)
- [ ] Create `notifications` table
- [ ] Write database trigger: Connect action → create notification
- [ ] Write database trigger: Mutual connect → update both statuses
- [ ] Write database trigger: No Thanks → delete/reject both rows
- [ ] Create RLS policies for notifications table
- [ ] Build Supabase function: Clear expired "Perhaps" holds (daily cron)
- [ ] Write query: Fetch unread notifications with user details
- [ ] Write query: Mark notification as read

### Real-time Updates (Supabase Subscriptions)
- [ ] Subscribe to notifications table changes
- [ ] Subscribe to connections table changes
- [ ] Update bell badge count in real-time
- [ ] Show success popup immediately when mutual connection occurs

---

## Process Questions / Validation

1. ✅ **Confirmed**: "No Thanks" removes match for BOTH users (mutual rejection)
2. ✅ **Confirmed**: "Perhaps" by User B keeps User A in Pending (no notification to A)
3. ✅ **Confirmed**: Connection notifications cannot be dismissed without action
4. ✅ **Confirmed**: Success popup shows email for outreach
5. ✅ **Confirmed**: Entire flow is symmetrical (works same if B goes first)

### Questions to Consider:
- **"Perhaps" reappear timing**: Currently set to 5 days - is this the right duration?
- **Rejected matches**: Should we soft-delete (status='rejected') or hard-delete from database?
- **Notification expiry**: Should connection request notifications expire after X days?
- **Email in success popup**: Should we also show phone number if provided?
- **Multiple "Perhaps" actions**: If User B clicks "Perhaps" multiple times, should the holding period extend or reset?

---

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INITIAL STATE                             │
│  Algorithm Match: A ←→ B (both see each other's cards)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
            ┌───────────────┴───────────────┐
            │                               │
    ┌───────▼────────┐            ┌────────▼───────┐
    │  User A Action │            │  User B Action │
    └───────┬────────┘            └────────┬───────┘
            │                              │
    ┌───────┴────────┬──────────┬─────────┴────────┬──────────┐
    │                │          │                  │          │
┌───▼───┐    ┌──────▼─────┐ ┌──▼──────┐   ┌──────▼─────┐ ┌──▼──────┐
│Connect│    │  Perhaps   │ │No Thanks│   │  Perhaps   │ │No Thanks│
└───┬───┘    └──────┬─────┘ └──┬──────┘   └──────┬─────┘ └──┬──────┘
    │               │          │                  │          │
    │               │          │                  │          │
    │           ┌───▼───┐      │              ┌───▼───┐      │
    │           │ Saved │      │              │ Saved │      │
    │           │ (A)   │      │              │ (B)   │      │
    │           └───┬───┘      │              └───┬───┘      │
    │               │          │                  │          │
┌───▼────┐      ┌───▼───┐      │              ┌───▼───┐      │
│Pending │      │ Wait  │      │              │ Wait  │      │
│  (A)   │      │5 days │      │              │5 days │      │
└───┬────┘      └───┬───┘      │              └───┬───┘      │
    │               │          │                  │          │
┌───▼────────┐      │          │                  │          │
│ Bell Notif │      │          │                  │          │
│    (B)     │      │          │                  │          │
└───┬────────┘      │          │                  │          │
    │               │          │                  │          │
    │           ┌───▼──────────▼──────────────────▼──────────▼┐
    │           │      🚫 MUTUAL REJECTION (No Thanks)        │
    │           │   Both users removed from each other's list │
    │           └──────────────────────────────────────────────┘
    │
    │  B's Response Options:
    │
    ├─── Connect ──→ ✅ MUTUAL CONNECTION
    │                  └─ Both to "Saved/Connected"
    │                  └─ Success Popup (both users)
    │                  └─ Show email for outreach
    │
    ├─── Perhaps ──→ ⏳ HOLDING STATE
    │                  └─ A stays in Pending
    │                  └─ B's card hidden for 5 days
    │                  └─ Reappears in Recommended after 5 days
    │
    └─── No Thanks ──→ 🚫 MUTUAL REJECTION
                       └─ Both removed from each other
                       └─ A's Pending disappears
                       └─ No future matches
```

---

## Current vs. Desired State

### Current Implementation Gaps:
1. ❌ Notifications table doesn't exist
2. ❌ Bell icon not functional
3. ❌ "Pending" tab not differentiated from "Saved"
4. ❌ No success popup on mutual connection
5. ❌ "Perhaps" holding period not implemented
6. ❌ "No Thanks" doesn't remove match for BOTH users

### Priority Implementation Order:
1. **Phase 1**: Database setup (notifications table, update matches schema)
2. **Phase 2**: Notification system (bell icon, dropdown, badge count)
3. **Phase 3**: Connection flow (Pending tab, mutual connection detection)
4. **Phase 4**: Success popup with email
5. **Phase 5**: "Perhaps" holding period automation
6. **Phase 6**: Mutual rejection logic (No Thanks affects both)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Created By**: Claude Code for Jeff Hill / BudE
**Status**: Ready for Developer Review
