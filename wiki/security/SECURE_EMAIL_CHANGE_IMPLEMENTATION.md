# Secure Email Change Implementation

## Overview
This document describes the secure two-step email change implementation that addresses the security vulnerability where an attacker could change the account email before the original owner is notified.

## Security Problem (Original Flow)
**Vulnerable Flow:**
1. Attacker gains temporary access to victim's account
2. Attacker changes email to their own
3. Confirmation sent to NEW email (attacker) → attacker confirms immediately
4. Confirmation sent to OLD email (victim) → arrives 3+ minutes later
5. Attacker has control before victim even knows

**Result:** Account takeover vulnerability

---

## New Secure Flow

### Industry-Standard Two-Step Verification

**Phase 1: Initiation**
1. User requests email change in Settings
2. System creates `email_change_request` record
3. Emails sent to **BOTH** addresses simultaneously:
   - **Old Email**: "Confirm this change" + "Cancel if not you"
   - **New Email**: "Verify you own this address"

**Phase 2: Dual Confirmation Required**
4. **Both emails must confirm** within 24 hours
5. Order doesn't matter - either can confirm first
6. Change only completes when BOTH have confirmed

**Phase 3: Completion**
7. After both confirmations → email updated in:
   - Supabase Auth (`auth.users`)
   - Application database (`users` table)
8. Request marked as completed

### Security Benefits
✅ Old email can **cancel** the request at any time
✅ Old email must **approve** before change happens
✅ 24-hour expiration prevents indefinite pending requests
✅ Attacker cannot complete change without access to old email
✅ User maintains control even if session is compromised

---

## Implementation Files

### 1. Database Schema
**File:** `create-email-change-requests-table.sql`

**Table:** `email_change_requests`
```sql
- id (UUID, primary key)
- user_id (UUID, references auth.users)
- old_email (TEXT)
- new_email (TEXT)
- old_email_confirmed (BOOLEAN, default FALSE)
- new_email_confirmed (BOOLEAN, default FALSE)
- old_email_token (TEXT, unique)
- new_email_token (TEXT, unique)
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP, default NOW() + 24 hours)
- completed_at (TIMESTAMP, nullable)
- cancelled_at (TIMESTAMP, nullable)
```

**Security Features:**
- Row Level Security (RLS) enabled
- Users can only see their own requests
- Unique tokens prevent guessing
- Automatic expiration after 24 hours
- Cleanup function for expired requests

### 2. API Endpoints

#### `/api/requestEmailChange.js`
**Purpose:** Initiates email change process

**Input:**
```javascript
{
  oldEmail: "current@example.com",
  newEmail: "new@example.com",
  userId: "user-uuid"
}
```

**Process:**
1. Validates new email format
2. Checks if new email already in use
3. Cancels any existing pending requests
4. Generates secure random tokens (32 bytes each)
5. Creates `email_change_request` record
6. Sends confirmation emails to BOTH addresses

**Output:**
```javascript
{
  success: true,
  message: "Email change request created. Please check BOTH email addresses...",
  requestId: "request-uuid"
}
```

#### `/api/confirmEmailChange.js`
**Purpose:** Confirms email (old or new)

**Input:**
```javascript
{
  token: "confirmation-token",
  type: "old" | "new"
}
```

**Process:**
1. Finds request by token
2. Checks if expired (24 hours)
3. Marks email as confirmed
4. **If both confirmed:**
   - Updates `auth.users` email
   - Updates `users` table email
   - Marks request as completed
5. **If only one confirmed:**
   - Returns "waiting for other email"

**Output (Both Confirmed):**
```javascript
{
  success: true,
  completed: true,
  message: "Email change completed successfully!",
  newEmail: "new@example.com"
}
```

**Output (One Confirmed):**
```javascript
{
  success: true,
  completed: false,
  message: "Old email confirmed. Waiting for confirmation from your new email address.",
  waitingFor: "new"
}
```

#### `/api/cancelEmailChange.js`
**Purpose:** Cancels pending email change

**Input:**
```javascript
{
  token: "old-email-token"  // Only old email can cancel
}
```

**Process:**
1. Finds request by old email token
2. Marks request as cancelled
3. Email remains unchanged

**Output:**
```javascript
{
  success: true,
  message: "Email change request cancelled successfully. Your email address remains unchanged."
}
```

### 3. Frontend Integration

**File:** `src/components/Settings.jsx`

**Changes:**
- Line 338-372: New email change handler
- Calls `/api/requestEmailChange` instead of `supabase.auth.updateUser()`
- Shows clear instructions to check BOTH emails
- Prevents other profile updates during email change
- Removes direct email update from database

**User Experience:**
1. User changes email in Settings form
2. Clicks "Save Changes"
3. Sees alert: "Check BOTH email addresses for confirmation links"
4. Must complete both confirmations within 24 hours
5. Can log in with old email until both confirmations complete

---

## Setup Instructions

### Step 1: Run Database Migration
```bash
# In Supabase SQL Editor or via CLI
psql -h YOUR_SUPABASE_HOST -d postgres -f create-email-change-requests-table.sql
```

### Step 2: Set Environment Variables
Ensure your `.env` or Vercel environment includes:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**⚠️ Security Note:** `SUPABASE_SERVICE_ROLE_KEY` is required for admin operations (updating auth email). Keep this secret and NEVER expose it in frontend code.

### Step 3: Deploy API Endpoints
```bash
# Deploy to Vercel (if using Vercel)
vercel --prod

# API endpoints will be available at:
# https://yoursite.com/api/requestEmailChange
# https://yoursite.com/api/confirmEmailChange
# https://yoursite.com/api/cancelEmailChange
```

### Step 4: Email Integration (TODO)
The current implementation logs emails to console. You need to integrate an email service:

**Options:**
- **Resend** (recommended, modern, simple)
- **SendGrid** (established, reliable)
- **AWS SES** (cost-effective at scale)
- **Mailgun** (developer-friendly)

**Files to update:**
- `/api/requestEmailChange.js` lines 65-123 (replace console.log with actual email sending)

**Email Template Requirements:**
- Include confirmation links with tokens
- Include cancellation link (for old email)
- Clear expiration warning (24 hours)
- Professional, trustworthy design

---

## Testing Checklist

### Test Scenario 1: Normal Email Change
- [ ] User changes email in Settings
- [ ] Both emails receive confirmation links
- [ ] User confirms old email → sees "waiting for new email"
- [ ] User confirms new email → email change completes
- [ ] User can log in with new email
- [ ] Old email no longer works for login

### Test Scenario 2: Attacker Scenario (Security Test)
- [ ] Simulate attacker changes email
- [ ] Confirm new email (attacker's email)
- [ ] Verify old email still has control (can cancel)
- [ ] Verify change does NOT complete without old email confirmation
- [ ] Confirm old email cancels the request
- [ ] Verify email remains unchanged

### Test Scenario 3: Expiration
- [ ] Request email change
- [ ] Wait 25 hours
- [ ] Try to confirm with token
- [ ] Verify error: "This confirmation link has expired"
- [ ] Run cleanup function
- [ ] Verify expired request deleted from database

### Test Scenario 4: Email Already in Use
- [ ] Try to change to an email that belongs to another user
- [ ] Verify error: "This email is already in use"
- [ ] Verify no email change request created

### Test Scenario 5: Concurrent Requests
- [ ] Start email change to email-A
- [ ] Start another email change to email-B (before confirming first)
- [ ] Verify first request is cancelled
- [ ] Verify only second request is active

---

## Security Considerations

### 1. Token Security
✅ **Implemented:**
- Tokens are 32-byte cryptographically random strings
- Tokens are unique (database constraint)
- Tokens expire after 24 hours

❌ **NOT Implemented (Consider Adding):**
- Rate limiting on confirmation attempts
- IP logging for suspicious activity
- CAPTCHA on email change requests

### 2. Email Delivery
⚠️ **Critical:**
- Ensure emails are sent via **transactional email service** (not personal Gmail/Outlook)
- Use **DKIM, SPF, DMARC** to prevent spoofing
- Monitor email **deliverability rates**
- Have **fallback** if email service fails

### 3. User Education
Consider adding:
- FAQ: "Why do I need to confirm both emails?"
- Warning in UI: "This protects you from account takeover"
- Email security tips page

---

## Future Enhancements

### Short-term
1. **Email Service Integration** - Replace console.log with real emails
2. **Confirmation Pages** - Create UI for `/confirm-email-change` and `/cancel-email-change` URLs
3. **Email Templates** - Professional HTML email design
4. **Loading States** - Show progress in Settings while request processes

### Medium-term
5. **SMS Verification** - Optional phone number confirmation
6. **Email History** - Show users their past email changes
7. **Security Alerts** - Notify if email change attempted from new location/device
8. **Admin Dashboard** - View/manage email change requests

### Long-term
9. **Two-Factor Authentication** - Require 2FA before email changes
10. **Biometric Confirmation** - Use WebAuthn for extra security
11. **Account Recovery** - Secure recovery if both emails are lost

---

## Troubleshooting

### Problem: "Failed to initiate email change"
**Possible Causes:**
- New email already in use
- Service role key not set
- Database permissions issue

**Solution:**
```sql
-- Check if email exists
SELECT email FROM users WHERE email = 'new@example.com';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'email_change_requests';
```

### Problem: "Invalid or expired confirmation link"
**Possible Causes:**
- Token expired (>24 hours)
- Request already completed
- Request was cancelled

**Solution:**
```sql
-- Check request status
SELECT * FROM email_change_requests
WHERE old_email_token = 'token-here'
OR new_email_token = 'token-here';
```

### Problem: Emails not sending
**Possible Causes:**
- Email service not integrated (still using console.log)
- API key incorrect
- Email blocked by spam filters

**Solution:**
1. Check `/api/requestEmailChange.js` logs
2. Test email service independently
3. Check spam folder
4. Verify DKIM/SPF/DMARC records

---

## API Error Codes

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | Missing required fields | `oldEmail`, `newEmail`, or `userId` missing |
| 400 | Invalid email format | New email doesn't match regex |
| 400 | Email already in use | New email belongs to another account |
| 400 | Invalid request parameters | Missing `token` or `type` |
| 400 | Confirmation link expired | More than 24 hours passed |
| 404 | Invalid or expired link | Token not found or request completed/cancelled |
| 405 | Method not allowed | Used GET instead of POST |
| 500 | Internal server error | Database or auth system failure |

---

## Database Maintenance

### Cleanup Expired Requests
```sql
-- Run manually or via cron job (daily)
SELECT cleanup_expired_email_change_requests();
```

### View Active Requests
```sql
SELECT
  u.email as current_email,
  ecr.new_email,
  ecr.old_email_confirmed,
  ecr.new_email_confirmed,
  ecr.expires_at,
  AGE(ecr.expires_at, NOW()) as time_remaining
FROM email_change_requests ecr
JOIN users u ON u.id = ecr.user_id
WHERE completed_at IS NULL
  AND cancelled_at IS NULL
  AND expires_at > NOW()
ORDER BY created_at DESC;
```

### Cancel All Pending Requests for User
```sql
UPDATE email_change_requests
SET cancelled_at = NOW()
WHERE user_id = 'user-uuid'
  AND completed_at IS NULL
  AND cancelled_at IS NULL;
```

---

## Summary

This implementation follows industry best practices for secure email changes:

✅ **Dual confirmation required** (both old and new email)
✅ **Old email can cancel** at any time
✅ **Time-limited** (24 hour expiration)
✅ **Secure tokens** (cryptographically random)
✅ **Prevents account takeover** from temporary access
✅ **Clear user communication** about security process

The security reporter was absolutely correct - this vulnerability needed to be fixed. The new flow protects users from account takeover even if an attacker gains temporary access to their account.

**Next Steps:**
1. Run database migration
2. Integrate email service
3. Deploy API endpoints
4. Test all scenarios
5. Monitor for issues

---

**Implementation Date:** November 10, 2025
**Security Level:** High
**Status:** Ready for Testing
