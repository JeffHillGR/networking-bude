# Notification System Report
**Date:** November 1, 2025
**Prepared for:** Developer handoff
**Issue:** Notification database table being populated despite notification code supposedly removed

---

## Executive Summary

The `notifications` table in Supabase is still being populated when users attempt to connect with each other. Investigation reveals that:

1. **No frontend code** currently inserts records into the `notifications` table
2. **Database trigger** likely exists in Supabase that auto-creates notification records when matches table status changes to 'pending'
3. **Current connection flow** uses mailto links (temporary solution) after Resend API failed with 403 errors
4. **NotificationBell component** exists but only displays UI - does NOT fetch from notifications table

---

## Current Connection Request Flow

### Code Location: `src/components/Connections.jsx`

**Function:** `handleSendConnectionRequest()` (Lines 229-348)

**What happens when user clicks "Connect":**

1. **Updates matches table** (Lines 234-241):
   ```javascript
   await supabase
     .from('matches')
     .update({
       status: 'pending',
       pending_since: new Date().toISOString()
     })
     .eq('user_id', currentUserId)
     .eq('matched_user_id', person.id);
   ```

2. **Checks for mutual connection** (Lines 246-271):
   - Queries if recipient already sent request to sender
   - If yes: Updates both matches to status 'connected'
   - If no: Leaves as 'pending'

3. **Opens mailto link** (Lines 284-301):
   - Creates email subject and body
   - Opens user's default email client with pre-filled email
   - **Does NOT send email via API**
   - **Does NOT create notification record directly**

4. **Updates local state** (Lines 304-331):
   - Adds to `pendingConnections` or `savedConnections` arrays
   - Closes modal

### Key Finding:
**No direct INSERT into notifications table in frontend code**

---

## Notification Bell Component

### Code Location: `src/components/NotificationBell.jsx`

**Current Status:** UI-only component (Lines 1-52)

**What it does:**
- Renders bell icon in header
- Shows dropdown when clicked
- Displays hardcoded "No notifications" message
- **Does NOT query Supabase notifications table**
- **Does NOT display real notifications**

**Where it's used:**
- `src/components/Dashboard.jsx` (Line 430 - Desktop header)
- `src/components/Dashboard.jsx` (Line 828 - Mobile header)

### Code Snippet:
```javascript
{/* No Notifications Message */}
<div className="p-8 text-center text-gray-500">
  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
  <p className="text-sm font-medium">No notifications</p>
  <p className="text-xs text-gray-400 mt-1">Coming soon!</p>
</div>
```

---

## Email Notification System (Broken)

### Code Location: `api/sendConnectionEmail.js`

**Current Status:** Not being called from frontend

**What it does:**
- Receives connection request data
- Sends email via Resend API
- **Problem:** Resend API returns 403 errors (domain not verified)

**Email details:**
- From: `BudE Connections <connections@networkingbude.com>`
- Subject: `{SenderName} wants to connect with you on Networking BudE`
- Includes: Profile info, compatibility score, personal message, CTA button

### Issue Timeline:
1. Resend API was initially implemented
2. DNS verification failed (403 errors)
3. Switched to mailto links as temporary solution
4. Email API endpoint still exists but unused

---

## Where Notifications Table is Being Populated

### Investigation Findings:

**Hypothesis:** Database trigger in Supabase

When reviewing the code:
- ❌ No `INSERT INTO notifications` in frontend
- ❌ No API endpoint creating notifications
- ✅ Notifications table has 8 entries from Oct 31 - Nov 1
- ✅ Timestamps match connection attempts by real users

**Likely source:**
- **Supabase database trigger** on `matches` table
- Fires when `status` column changes to 'pending'
- Automatically creates notification record for recipient

### To verify, run this SQL in Supabase:
```sql
-- Check for triggers on matches table
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'matches'
  AND event_object_schema = 'public';
```

### To check for webhook:
1. Go to Supabase Dashboard
2. Navigate to Database → Webhooks
3. Look for webhook on `matches` table INSERT/UPDATE

---

## Notification Preferences (Settings)

### Code Location: `src/components/Settings.jsx` (Lines 567-577)

Users can configure notification preferences:
- Email Notifications
- Push Notifications
- New Messages
- New Matches
- Event Reminders
- Weekly Digest

Saved to `notification_preferences` table, but **not currently enforced** anywhere.

---

## Affected Users

Based on `notifications` table entries (Oct 31 - Nov 1):

1. **rob.geer@gmail.com** (2 attempts)
2. **megderrer@gmail.com** (1 attempt)
3. **joel.vankuiken@gmail.com** (2 attempts)
4. **grjeff@gmail.com** (Test by Jeff - 1 attempt)

**Impact:**
- Users clicked "Connect"
- Database updated to 'pending' status
- Notification record created (via trigger)
- ❌ No email sent (Resend API failed)
- ❌ No in-app notification shown (NotificationBell doesn't query DB)
- **Result:** Silent failure - users don't know request didn't go through

---

## Recommended Fixes

### 1. Fix Resend Email API (Priority: HIGH)
- Verify domain `networkingbude.com` in Resend dashboard
- Add required DNS records (SPF, DKIM, DMARC)
- Test email delivery
- Re-enable email sending in `handleSendConnectionRequest()`

### 2. Connect NotificationBell to Database (Priority: HIGH)
Update `src/components/NotificationBell.jsx` to:
```javascript
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  async function fetchNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', currentUserId)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error) {
      setNotifications(data);
      setUnreadCount(data.length);
    }
  }
  fetchNotifications();
}, [currentUserId]);
```

### 3. Remove or Keep Database Trigger (Priority: MEDIUM)
**Decision needed:**
- **Option A:** Keep trigger, use it for in-app notifications
- **Option B:** Remove trigger, create notifications only when email sends successfully

### 4. Add Notification Badge (Priority: MEDIUM)
Show unread count on bell icon:
```javascript
{unreadCount > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
    rounded-full h-5 w-5 flex items-center justify-center">
    {unreadCount}
  </span>
)}
```

### 5. Implement Real-time Subscriptions (Priority: LOW)
Use Supabase real-time for instant notification updates:
```javascript
useEffect(() => {
  const subscription = supabase
    .channel('notifications')
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${currentUserId}`
      },
      (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [currentUserId]);
```

---

## Database Schema

### notifications table (assumed structure):
```sql
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  recipient_id BIGINT REFERENCES users(id),
  sender_id BIGINT REFERENCES users(id),
  type TEXT, -- 'connection_request', 'message', 'event_reminder', etc.
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### matches table (relevant columns):
```sql
CREATE TABLE matches (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  matched_user_id BIGINT REFERENCES users(id),
  status TEXT, -- 'recommended', 'pending', 'connected', 'passed', 'perhaps'
  pending_since TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  compatibility_score INTEGER
);
```

---

## Files Referenced

### Frontend (React):
- `src/components/Connections.jsx` (Connection request logic)
- `src/components/NotificationBell.jsx` (UI-only notification bell)
- `src/components/Dashboard.jsx` (Uses NotificationBell component)
- `src/components/Settings.jsx` (Notification preferences)

### Backend (Vercel Serverless):
- `api/sendConnectionEmail.js` (Resend email API - currently failing)
- `api/notifyNewUser.js` (Admin notification for new signups)
- `api/submitConnectionRequest.js` (Google Sheets logger - deprecated)

### Database:
- `supabase_migration_connections.sql` (Schema migration for matches table)
- `check-triggers.sql` (SQL to check for database triggers)

---

## Testing Checklist

Before deploying fixes:
- [ ] Verify Resend domain configuration
- [ ] Test email delivery in production
- [ ] Test NotificationBell fetches real notifications
- [ ] Test unread count badge updates
- [ ] Test real-time subscription (if implemented)
- [ ] Test notification preferences are enforced
- [ ] Test mobile and desktop views
- [ ] Manually connect 2 test users and verify both get notifications

---

## Questions for Developer

1. **Should we keep the database trigger?** Or create notifications only on successful email delivery?
2. **Do we want real-time notifications?** Or is polling on page load sufficient?
3. **Should we migrate away from mailto links?** Once Resend is fixed?
4. **Mark notifications as read:** When user clicks on them or views Connections tab?
5. **Notification retention:** Delete after 30 days? Archive read notifications?

---

## Contact

For questions about this report:
- User: Jeff (grjeff@gmail.com)
- GitHub: networking-bude-clean/bude-app
- Deployed: https://networking-bude.vercel.app

---

**End of Report**
