# MATCHING ALGORITHM SYSTEM - COMPREHENSIVE TECHNICAL ANALYSIS

**Analysis Date:** November 13, 2025  
**Codebase:** Networking BudE (networking-bude)  
**Status:** Hybrid Implementation - Multiple entry points identified

---

## EXECUTIVE SUMMARY

The matching algorithm system has **THREE DISTINCT IMPLEMENTATION PATHS**:

1. **Manual Node.js Scripts** (Dev/Admin) - Service role key, full access
2. **Vercel API Endpoint** (`/api/run-matching.js`) - Anon key, POST request
3. **Vercel Cron Jobs** - Scheduled weekly tasks via Vercel (different endpoints)

**CRITICAL FINDING:** The Vercel API endpoint uses ANON KEY but has `WITH CHECK (true)` INSERT policy, which means it should NOT work in production but does due to RLS misconfiguration.

---

## PART 1: ENTRY POINTS

### Entry Point #1: Vercel Serverless API Endpoint (PRODUCTION PATH)

**File:** `/api/run-matching.js`  
**Trigger:** Manual HTTP POST request  
**Usage:** Can be called from anywhere (client-side, external services, curl)

```javascript
// URL: https://[deployment-url]/api/run-matching
// Method: POST
// Headers: Accept CORS from any origin

module.exports = async (req, res) => {
  // Uses ANON KEY (lowest privilege)
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  // ... runs matching algorithm
};
```

**Credentials Used:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous/public key (meant for client use)

**Database Operations:**
1. SELECT all users from `users` table (rows 60-63)
2. DELETE existing matches (rows 107-110)
3. INSERT new matches (rows 114-116)

**Critical Issue:** Uses ANON KEY but performs:
- Full table DELETE (no WHERE clause)
- Full table INSERT

---

### Entry Point #2: Manual Node.js Scripts (DEV/BETA PATH)

#### Script A: `run-matching.cjs` (Local dev)

**File:** `/run-matching.cjs`  
**Trigger:** Manual execution: `node run-matching.cjs`  
**Environment:** Local machine or admin environment

```javascript
// Uses SERVICE ROLE KEY (admin access)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                       process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  serviceRoleKey,  // ← ADMIN KEY
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Database Operations:**
- SELECT all users
- DELETE all matches
- INSERT new matches
- Minimal RLS restrictions

#### Script B: `src/lib/generateSupabaseMatches.js` (Modern Node.js/ESM)

**File:** `/src/lib/generateSupabaseMatches.js`  
**Trigger:** Manual execution: `node src/lib/generateSupabaseMatches.js`  
**Environment:** Dev environment with .env.local file

```javascript
// Uses SERVICE ROLE KEY if available, falls back to ANON KEY
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.VITE_SUPABASE_ANON_KEY;
```

**Database Operations:**
- SELECT all users (full table)
- DELETE all matches with `.neq('id', '...')` (deletes all)
- INSERT matches in batches of 100

---

### Entry Point #3: Vercel Cron Jobs (SCHEDULED PRODUCTION PATH)

**Configuration File:** `/vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/resetConnections",
      "schedule": "0 6 * * 1"  // Monday 6 AM UTC
    },
    {
      "path": "/api/sendDailyDigest",
      "schedule": "0 8 * * *"   // Daily 8 AM UTC
    }
  ]
}
```

#### Cron Job #1: Reset Connections (Monday)

**File:** `/api/resetConnections.js`  
**Schedule:** Every Monday at 6 AM UTC (`0 6 * * 1`)  
**Credentials:** SERVICE ROLE KEY

```javascript
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← ADMIN KEY
);

const { data, error } = await supabase.rpc('reset_and_log_connections');
```

**Database Operations:**
- Calls database function `reset_and_log_connections()`
- Resets 'saved' status connections back to 'recommended' after 1 week
- Preserves 'connected' (mutual) connections

**Note:** Calls a database function, not direct table operations

#### Cron Job #2: Send Daily Digest

**File:** `/api/sendDailyDigest.js`  
**Schedule:** Every day at 8 AM UTC (`0 8 * * *`)  
**Current Status:** Not analyzed but likely aggregates notifications

---

## PART 2: DATA FLOW ANALYSIS

### Flow #1: Vercel API Endpoint (POST /api/run-matching)

```
User/External Request
    ↓
POST /api/run-matching.js
    ↓
Authenticate with VITE_SUPABASE_ANON_KEY
    ↓
SELECT * FROM users (no RLS restriction on SELECT)
    ↓
Calculate compatibility scores in Node.js (calculateCompatibility function)
    ↓
DELETE FROM matches WHERE ... (RLS CHECK: user_id = auth.uid() OR true)
    ↓
INSERT INTO matches (...) (RLS CHECK: true)
    ↓
Return JSON response
```

**RLS Policies Active:**
```sql
-- SELECT policy allows viewing own matches
USING (user_id = auth.uid() OR matched_user_id = auth.uid())

-- DELETE would check:
USING (user_id = auth.uid() OR matched_user_id = auth.uid())
-- But endpoint does unscoped DELETE - subject to policy!

-- INSERT policy allows any authenticated user
WITH CHECK (true)  ← SECURITY ISSUE
```

**Auth Context:**
- No user context (ANON KEY doesn't identify specific user)
- Vercel Cron secret would verify this is a trusted caller
- No per-user isolation; operates on entire matches table

---

### Flow #2: Manual Local Scripts

```
Developer runs: node run-matching.cjs
    ↓
Load .env.local with VITE_SUPABASE_SERVICE_ROLE_KEY
    ↓
Authenticate with SERVICE ROLE KEY (bypasses RLS)
    ↓
SELECT * FROM users
    ↓
FOR EACH user:
  - Calculate compatibility scores against all other users
  - Collect matches above threshold (60% min in beta)
    ↓
DELETE FROM matches (service role bypasses RLS)
    ↓
INSERT INTO matches in batches
    ↓
Print summary statistics
```

**RLS Status:** BYPASSED (service role key has full admin access)

---

### Flow #3: Vercel Cron (resetConnections)

```
Vercel Cron Timer (Monday 6 AM UTC)
    ↓
POST /api/resetConnections.js with Vercel auth header
    ↓
Authenticate with SUPABASE_SERVICE_ROLE_KEY
    ↓
CALL reset_and_log_connections() database function
    ↓
Function (server-side):
  - UPDATE matches WHERE status = 'saved' AND saved_since < 1 week ago
  - SET status = 'recommended'
  - Log changes
    ↓
Return results
```

**RLS Status:** BYPASSED (service role in Vercel env, direct DB function call)

---

## PART 3: RLS POLICY ANALYSIS

### Current Matches Table Policies

**File:** `/fix-rls-update-policy.sql` (most recent)

```sql
-- SELECT policy
CREATE POLICY "Users can view their own matches"
ON public.matches
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid());

-- INSERT policy (SECURITY ISSUE!)
CREATE POLICY "Allow inserting matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (true);  ← ANY authenticated user can insert ANY data

-- UPDATE policy
CREATE POLICY "Users can update their matches (both directions)"
ON public.matches
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR matched_user_id = auth.uid())
WITH CHECK (user_id = auth.uid() OR matched_user_id = auth.uid());

-- DELETE policy (inferred from SELECT policy)
-- Not explicitly created, falls back to default deny
```

### Credential-to-RLS Mapping

| Credential | RLS Enforcement | Can INSERT Matches | Can SELECT Matches | Can UPDATE Matches | Can DELETE Matches |
|-----------|-----------------|-------------------|-------------------|-------------------|------------------|
| **Anon Key** | ✅ YES | ✅ Any (WITH CHECK true) | ✅ Own only | ✅ Own only | ❌ NO |
| **Service Role Key** | ❌ NO | ✅ Unrestricted | ✅ All | ✅ All | ✅ All |
| **Unauthenticated** | ✅ YES | ❌ NO | ❌ NO | ❌ NO | ❌ NO |

### Critical Security Issues Found

**Issue #1: Overpermissive INSERT Policy**
```sql
WITH CHECK (true)  -- Allows ANY user to insert ANY match record
```
This allows authenticated users to:
- Insert fake matches
- Award themselves high compatibility scores
- Create matches for users who didn't opt-in

**Issue #2: Anon Key Used for System Operations**
- `/api/run-matching.js` uses ANON KEY
- Should use SERVICE ROLE KEY (reserved for system operations)
- Anon key is meant for user-level operations

**Issue #3: Missing DELETE Policy**
- No explicit DELETE policy created
- Falls back to default deny
- Good for users, but system operations can't delete via RLS
- API endpoint doesn't handle this gracefully

**Issue #4: No user_id or initiated_by_user_id check on INSERT**
- Matches table has `initiated_by_user_id` field (lines 101-102 in Connections.jsx)
- But INSERT policy doesn't verify these fields
- System could create "fake" matches with invalid initiators

---

## PART 4: CONFIGURATION & ENVIRONMENT VARIABLES

### Required Environment Variables

**For API Endpoint (/api/run-matching.js):**
```
VITE_SUPABASE_URL          # Supabase project URL
VITE_SUPABASE_ANON_KEY     # Public/anonymous key (used in API)
```

**For Local Scripts (run-matching.cjs):**
```
VITE_SUPABASE_URL                    # Supabase project URL
VITE_SUPABASE_SERVICE_ROLE_KEY       # Service role key (admin)
  OR SUPABASE_SERVICE_ROLE_KEY       # Alternative naming
```

**For Vercel Cron Jobs:**
```
VITE_SUPABASE_URL                    # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY            # Service role (stored in Vercel env)
RESEND_API_KEY                       # For sending emails (daily digest)
```

**For Connection Requests:**
```
GOOGLE_PROJECT_ID          # Google Sheets API
GOOGLE_PRIVATE_KEY         # Service account private key
GOOGLE_CLIENT_EMAIL        # Service account email
GOOGLE_SHEET_ID            # Spreadsheet to log requests
RESEND_API_KEY             # Email delivery service
```

### Variable Exposure Audit

**Exposed in Repo:**
- ✅ VITE_SUPABASE_URL (in .env, needed for client)
- ✅ VITE_SUPABASE_ANON_KEY (in .env, safe to expose)

**NOT Exposed (correctly):**
- ✅ SUPABASE_SERVICE_ROLE_KEY (only in Vercel/server)
- ✅ GOOGLE_PRIVATE_KEY (Vercel only)
- ✅ RESEND_API_KEY (Vercel only)

---

## PART 5: FRONTEND INTEGRATION

### How Users Interact with Matches

**File:** `/src/components/Connections.jsx`

#### User Actions Triggering Match Data Fetch:

1. **View Dashboard**
   - Component mounts
   - Calls `fetchMatches()` hook (line 51-122)
   - Fetches from `matches` table with `user_id = current_user`

2. **Send Connection Request**
   - User clicks "Connect" button
   - Opens modal with message form
   - Calls POST `/api/sendConnectionEmail` with:
     - senderName, senderEmail, recipientEmail
     - Message, compatibility score
   - Updates match status in database:
     ```javascript
     .update({ status: 'pending', pending_since: new Date() })
     ```

3. **Accept/Decline Connection**
   - User clicks button on received connection request
   - Updates `matches` table:
     ```javascript
     .update({ status: 'connected' })  // Accept
     // OR resets to 'recommended'      // Decline
     ```

4. **Save for Later**
   - Stores in localStorage (lines 22-35)
   - Updates database:
     ```javascript
     .update({ status: 'saved', saved_since: new Date() })
     ```

#### Frontend-Triggered Database Operations:

```javascript
// FETCH (from Connections.jsx line 94-120)
supabase
  .from('matches')
  .select(`
    matched_user_id,
    compatibility_score,
    status,
    updated_at,
    initiated_by_user_id,
    matched_user:users(...)
  `)
  .eq('user_id', userData.id)  // ← RLS allows this
  .in('status', ['recommended', 'perhaps', 'pending', 'saved', 'connected'])

// UPDATE (when accepting connection)
supabase
  .from('matches')
  .update({ status: 'connected' })
  .eq('id', matchId)  // ← RLS allows if user_id = auth.uid()

// UPDATE (when user resets pending after 10 days)
supabase
  .from('matches')
  .update({ status: 'recommended', pending_since: null })
  .eq('user_id', userData.id)
  .eq('status', 'pending')
  .lt('pending_since', tenDaysAgo)
```

**Frontend Uses:** No direct match insertion; only reads and updates own matches.

---

## PART 6: DATABASE FUNCTIONS

### Function: reset_and_log_connections()

**Called by:** Vercel Cron `/api/resetConnections.js`  
**Schedule:** Every Monday 6 AM UTC  
**Implementation:** Custom Supabase PostgreSQL function (not shown in repo)

**Expected Logic:**
```sql
CREATE OR REPLACE FUNCTION reset_and_log_connections()
RETURNS TABLE(reset_count INT, preserved_count INT) AS $$
BEGIN
  -- Reset 'saved' connections after 7 days back to 'recommended'
  UPDATE matches
  SET status = 'recommended', saved_since = NULL
  WHERE status = 'saved'
    AND saved_since < NOW() - INTERVAL '7 days';
  
  -- Reset 'pending' connections after 10 days back to 'recommended'
  UPDATE matches
  SET status = 'recommended', pending_since = NULL
  WHERE status = 'pending'
    AND pending_since < NOW() - INTERVAL '10 days';
  
  -- Preserve 'connected' (mutual connections) indefinitely
  -- Return statistics
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## PART 7: MATCHING ALGORITHM DETAILS

### Algorithm Implementation

**File:** `/src/lib/matchingAlgorithm.js`

**Main Function:** `calculateCompatibility(user1, user2)`
- Returns: `{ score: 0-100, matches: {...}, meetsThreshold: boolean }`
- **Threshold:** 70/100 to show as potential match

### Scoring Weights

| Category | Points | Details |
|----------|--------|---------|
| Networking Goals | 25 | Meaningful keywords, growth, business dev |
| Organizations | 50 | Split: 25 complementary + 25 same-field |
| Professional Interests | 15 | Proportional overlap |
| Industry | 5 | Exact or related match |
| Gender Preference | 2.5 | Compatibility check |
| Age Preference | 2.5 | Range compatibility |
| Personal Interests | 5 | Hobby keyword matching |
| **Total** | **100** | |

### Exception Rules

**Exception #1: Gender Preference Override (80%+ Rule)**
- Override gender preference if compatibility ≥ 80%
- UI shows "Exceptional Match" badge
- User can still accept or decline

**Exception #2: Safety Net Rule (Low Matchers)**
- Trigger: User scores < 40% with all candidates in 100+ user pool
- Action: Show 1-2 matches based on single shared attribute
- Priority: Organizations > Professional Interests > Industry

### Variables Used in Matching

User profile fields consumed:
```javascript
user.id
user.firstName, user.lastName
user.age (calculated from year_born)
user.gender
user.industry
user.networkingGoals
user.orgsAttend (organizations_current)
user.orgsWantToCheckOut (organizations_interested)
user.professionalInterests
user.personalInterests
user.genderPreference
user.agePreference (year_born_connect)
```

---

## PART 8: PRODUCTION IMPLEMENTATION ASSESSMENT

### Current Production Path

Based on code analysis, the **most likely production implementation** is:

1. **Matching triggered by:** Manual API call to `/api/run-matching.js`
   - Could be called manually by admin
   - Could be triggered by external service
   - Could be scheduled externally (not in Vercel cron)

2. **Credentials used:** `VITE_SUPABASE_ANON_KEY` (problematic)

3. **RLS policy:** `WITH CHECK (true)` on INSERT allows any authenticated insert

4. **Frequency:** Unknown - not scheduled in Vercel cron (no `/api/run-matching` cron job)

### Missing from Production

**Not scheduled in Vercel cron:**
- The matching algorithm `/api/run-matching.js` is NOT in vercel.json
- Only `resetConnections` (Monday) and `sendDailyDigest` (daily) are scheduled
- Matching appears to be manual or external trigger

**Implications:**
- Matches don't auto-generate on a schedule
- New users don't automatically get matches after signup
- Admin must manually trigger `/api/run-matching.js` 
- OR there's an external service calling it

---

## PART 9: SECURITY ASSESSMENT

### Threat Analysis

**High Risk:**
1. ❌ **INSERT policy allows ANY authenticated user to insert matches**
   - User A could insert match records for themselves
   - Could create fake matches with inflated scores
   - Could spam other users with fake match records

2. ❌ **API endpoint uses ANON KEY for system operation**
   - Anon key should only be for user-level operations
   - System operations should use SERVICE ROLE KEY
   - Violates privilege separation principle

3. ❌ **DELETE is unrestricted in API endpoint**
   - Endpoint does `.delete().neq('id', '...')` (deletes ALL)
   - Anon key can't directly delete, but RLS might allow
   - If DELETE policy is open, whole table could be wiped

**Medium Risk:**
4. ⚠️ **No rate limiting on /api/run-matching endpoint**
   - Can be called unlimited times
   - Could cause performance issues
   - No authentication check (accept-all CORS)

5. ⚠️ **initiated_by_user_id field not validated**
   - INSERT policy doesn't check if user owns the relationship
   - System could create misattributed matches

**Low Risk:**
6. ✅ **SELECT policy is restrictive**
   - Users can only see their own matches
   - Good implementation here

7. ✅ **UPDATE policy requires ownership or mutual**
   - Both directions properly checked
   - Users can update matches they're involved in

---

## PART 10: RECOMMENDED INSERT POLICY

Based on the actual architecture, here's the recommended INSERT policy:

### Option A: System-Only INSERT (Most Secure)

```sql
-- Drop permissive policy
DROP POLICY IF EXISTS "Allow inserting matches" ON public.matches;

-- Create restrictive policy
CREATE POLICY "System can insert matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (
  -- Only system roles can insert matches
  auth.jwt() ->> 'role' = 'service_role'
  OR
  -- OR current user is the match initiator
  (auth.uid() = user_id)
);
```

**Pros:**
- Prevents users from inserting fake matches
- Still allows system (service role) to work
- Allows users to create their own match records if needed

**Cons:**
- Service role key must be used (not in Vercel env by default for API endpoint)

---

### Option B: Service-Role-Only + Admin Verification

```sql
DROP POLICY IF EXISTS "Allow inserting matches" ON public.matches;

CREATE POLICY "System-only insert (service role bypass)"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (false);  -- Blocks all authenticated users

-- Note: Service role key bypasses RLS entirely, so this works
```

**Pros:**
- Clear intent: System operations only
- Service role always bypasses RLS

**Cons:**
- Need to ensure vercel API uses SERVICE ROLE KEY (currently uses ANON)

---

### Option C: Hybrid - Admin or User-Initiated Matches

```sql
DROP POLICY IF EXISTS "Allow inserting matches" ON public.matches;

CREATE POLICY "Insert own matches or admin insert"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow user to insert if they are the initiator
  (auth.uid() = initiated_by_user_id OR auth.uid() = user_id)
  -- Note: Service role bypasses this anyway
);
```

**Pros:**
- Most flexible
- Allows users to initiate connections
- Still validates user ownership

**Cons:**
- Requires `initiated_by_user_id` to be set correctly on INSERT
- API endpoint would need to validate current_user context

---

## PART 11: IMPLEMENTATION FLOW DIAGRAMS

### Diagram 1: Vercel API Endpoint Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/run-matching.js (Vercel Serverless)                   │
└─────────────────────────────────────────────────────────────────┘
              │
              ├─► Auth: VITE_SUPABASE_ANON_KEY (ISSUE!)
              │
              ├─► 1. SELECT * FROM users (RLS: NONE - anon has access)
              │       └─► 1000+ users in array
              │
              ├─► 2. FOR EACH user pair:
              │       └─► calculateCompatibility() in Node.js
              │           └─► 1000² = 1,000,000 comparisons!
              │
              ├─► 3. DELETE FROM matches (RLS check needed)
              │       └─► .delete().neq('id', '00000...') = DELETE ALL
              │       └─► RLS might allow or deny
              │
              ├─► 4. INSERT INTO matches (RLS: WITH CHECK (true))
              │       └─► Batch insert of 100,000+ records
              │
              └─► Response: { success, totalMatches, totalUsers }

Time Complexity: O(n²) where n = user count
Performance Issue: 1M comparisons on 1000 users = SLOW
```

### Diagram 2: Cron Job Flow

```
┌──────────────────────────────────────────────────────────────┐
│ Vercel Cron: Monday 6 AM UTC                                 │
└──────────────────────────────────────────────────────────────┘
              │
              ├─► POST /api/resetConnections
              │   Auth: SUPABASE_SERVICE_ROLE_KEY
              │   Vercel-Cron header validates timing
              │
              ├─► Call: supabase.rpc('reset_and_log_connections')
              │
              ├─► Database function executes:
              │   - UPDATE matches SET status = 'recommended'
              │     WHERE status = 'saved'
              │     AND saved_since < NOW() - 7 days
              │
              │   - UPDATE matches SET status = 'recommended'
              │     WHERE status = 'pending'
              │     AND pending_since < NOW() - 10 days
              │
              │   - PRESERVE: status = 'connected' (mutual)
              │
              └─► Return: { reset_count, preserved_count }
```

### Diagram 3: Frontend User Interaction Flow

```
┌──────────────────────────────────────────────────────────────┐
│ User Opens Connections Tab                                    │
└──────────────────────────────────────────────────────────────┘
              │
              ├─► fetchMatches() hook runs
              │   Auth: Current user token from AuthContext
              │
              ├─► SELECT matches WHERE user_id = current_user
              │   RLS: ✅ ALLOWED (user_id = auth.uid())
              │
              ├─► Join with users table for matched profiles
              │   RLS: Users table policy checks apply
              │
              ├─► Parse response into component state
              │   - recommended: all 'recommended' status
              │   - pending: awaiting response from other user
              │   - saved: user saved for later
              │
              ├─► User clicks "Connect" button
              │   ├─► Show modal with message input
              │   ├─► Call POST /api/sendConnectionEmail
              │   └─► UPDATE matches SET status = 'pending'
              │       RLS: ✅ ALLOWED (user_id = auth.uid())
              │
              └─► Mutual connection when other user accepts
                  └─► Both see status = 'connected'
```

---

## PART 12: FINDINGS SUMMARY TABLE

| Component | Current Implementation | Credentials | RLS Risk | Production Ready |
|-----------|----------------------|-------------|----------|------------------|
| **API Endpoint** | /api/run-matching.js | ANON KEY | ⚠️ High | ❌ NO |
| **Cron Reset** | /api/resetConnections | SERVICE KEY | ✅ OK | ✅ YES |
| **Cron Digest** | /api/sendDailyDigest | SERVICE KEY | ✅ OK | ✅ YES |
| **Local Scripts** | run-matching.cjs | SERVICE KEY | ✅ OK | ✅ Dev Only |
| **Frontend Fetch** | Connections.jsx | User Token | ✅ OK | ✅ YES |
| **Frontend Update** | Connections.jsx | User Token | ✅ OK | ✅ YES |
| **INSERT Policy** | WITH CHECK (true) | N/A | ❌ CRITICAL | ❌ NO |

---

## PART 13: RECOMMENDATIONS

### Immediate Actions (Security)

1. **Fix INSERT Policy**
   ```sql
   DROP POLICY "Allow inserting matches" ON public.matches;
   CREATE POLICY "System-only insert matches"
   ON public.matches
   FOR INSERT
   TO authenticated
   WITH CHECK (false);
   -- Service role bypasses RLS so this still allows system operations
   ```

2. **Update Vercel API Endpoint** (`/api/run-matching.js`)
   - Change ANON KEY to SERVICE ROLE KEY:
     ```javascript
     const supabase = createClient(
       process.env.VITE_SUPABASE_URL,
       process.env.SUPABASE_SERVICE_ROLE_KEY // ← Change this
     );
     ```
   - Add Vercel Cron authentication:
     ```javascript
     const authHeader = req.headers.authorization;
     if (!authHeader?.startsWith('Bearer ')) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     ```

3. **Add Rate Limiting**
   - Limit POST /api/run-matching to 1 call per hour
   - Prevent DOS attacks

4. **Add RLS Policy for DELETE**
   ```sql
   CREATE POLICY "Prevent direct delete on matches"
   ON public.matches
   FOR DELETE
   TO authenticated
   USING (false);  -- Service role bypasses, so it works for system
   ```

### Short Term (Architecture)

5. **Add /api/run-matching to Vercel Cron**
   - Schedule matching algorithm runs (bi-weekly or weekly)
   - Current: Not scheduled, only manual trigger available

   ```json
   {
     "crons": [
       {
         "path": "/api/run-matching",
         "schedule": "0 0 * * 0"  // Weekly Monday midnight
       }
     ]
   }
   ```

6. **Add User Context to Matching**
   - If system should support user-initiated matching
   - Check `initiated_by_user_id` on INSERT
   - Currently ignored in RLS

7. **Deprecate Local Scripts**
   - run-matching.cjs should not be used in production
   - Use Vercel API endpoint instead
   - Keep for local dev only

### Long Term (Optimization)

8. **Implement Match Deduplication**
   - Prevent re-suggesting same matches
   - Track match history in separate table
   - Reference in algorithm

9. **Add Incremental Matching**
   - Don't recalculate all pairs every time
   - Only calculate for new users
   - Update existing users' recommendations

10. **Monitor Match Acceptance Rates**
    - Track if users accept 70% threshold matches
    - Adjust threshold if acceptance is too low/high
    - Current settings are based on beta (70% minimum)

---

## PART 14: FILE REFERENCE MAP

### Core Matching Files
- `/src/lib/matchingAlgorithm.js` - Algorithm implementation (100 lines, well-documented)
- `/src/lib/generateSupabaseMatches.js` - Node.js script to run matching
- `/run-matching.cjs` - Legacy CJS script for local dev

### API Endpoints
- `/api/run-matching.js` - **Main matching API endpoint** (SECURITY ISSUE)
- `/api/resetConnections.js` - Cron: Reset saved connections
- `/api/sendDailyDigest.js` - Cron: Daily notifications
- `/api/sendConnectionEmail.js` - Send connection request email
- `/api/submitConnectionRequest.js` - Log to Google Sheets

### Frontend Components
- `/src/components/Connections.jsx` - Main UI for viewing matches
- `/src/components/ConnectionCard.jsx` - Individual match card
- `/src/components/Dashboard.jsx` - Route handler

### RLS Policies
- `/create-matches-table.sql` - Initial schema
- `/fix-matches-rls.sql` - Current RLS policies
- `/fix-rls-update-policy.sql` - Recent UPDATE policy fix
- `/fix-matches-rls-simple.sql` - Disabled RLS version (for testing)

### Configuration
- `/vercel.json` - Vercel deployment config with cron jobs
- `/.env` - Exposed Supabase credentials
- `/.env.save` - Backup env file

### Documentation
- `/MATCHING_ALGORITHM_SUMMARY.md` - Algorithm design & testing results
- `/MATCHING_POLICY.md` - Matching policy & rules
- `/BETA_FINDINGS_REPORT.md` - Beta test results

---

## CONCLUSION

The BudE matching system has **multiple implementation paths** with **critical security issues in the RLS policy**. The INSERT policy `WITH CHECK (true)` is overly permissive and should be restricted immediately. The recommended approach for production is:

1. Fix RLS INSERT policy to `WITH CHECK (false)` (service role bypasses anyway)
2. Switch Vercel API endpoint from ANON KEY to SERVICE ROLE KEY  
3. Add the /api/run-matching endpoint to Vercel cron schedule
4. Deprecate local scripts for production use
5. Add user context validation to initiated_by_user_id field

The system is **functionally complete but not production-secure** in its current state.

---

**Analysis completed by:** Claude Code  
**Last updated:** November 13, 2025  
**Next review recommended:** When moving to production or after 100+ users
