# MATCHING SYSTEM - QUICK REFERENCE GUIDE

## Three Entry Points Overview

```
DEVELOPMENT                    SCHEDULED                    PRODUCTION
───────────────────────────────────────────────────────────────────────────
run-matching.cjs          resetConnections.js           run-matching.js
      ↓                         ↓                              ↓
SERVICE ROLE KEY        SERVICE ROLE KEY              ANON KEY (WRONG!)
    Local                  Monday 6 AM UTC            POST /api/endpoint
   Manual              RLS: BYPASSED ✓               RLS: WITH CHECK(true) ✗
RLS: BYPASSED ✓         Database function             Full table DELETE/INSERT
    ✓ Safe                  call ✓ Safe                      ✗ RISKY
```

---

## Current Production Status

**Currently in use:** Likely `/api/run-matching.js` (manual trigger)

**Not scheduled:** No Vercel cron job for matching runs

**Missing:** Automatic matching schedule in vercel.json

---

## Critical Security Issues

| Issue | Risk | Impact |
|-------|------|--------|
| INSERT policy has `WITH CHECK (true)` | HIGH | Users can insert fake matches |
| API endpoint uses ANON KEY | HIGH | Not meant for system operations |
| No rate limiting on API | MEDIUM | DOS attack possible |
| initiated_by_user_id not validated | MEDIUM | Misattributed matches possible |
| Matching not scheduled in cron | LOW | Manual trigger only, not auto |

---

## Required Fixes (Priority Order)

### IMMEDIATE (Security)
1. **Fix INSERT policy:**
   ```sql
   DROP POLICY "Allow inserting matches" ON public.matches;
   CREATE POLICY "System-only insert matches"
   ON public.matches
   FOR INSERT TO authenticated
   WITH CHECK (false);
   ```

2. **Update `/api/run-matching.js` to use SERVICE ROLE KEY**
   ```javascript
   // Change this:
   process.env.VITE_SUPABASE_ANON_KEY
   // To this:
   process.env.SUPABASE_SERVICE_ROLE_KEY
   ```

### SHORT TERM (Architecture)
3. **Add matching to Vercel cron schedule:**
   ```json
   {
     "crons": [
       {
         "path": "/api/run-matching",
         "schedule": "0 0 * * 0"  // Weekly Monday
       }
     ]
   }
   ```

### LONG TERM (Optimization)
4. Add incremental matching (don't recalculate all pairs)
5. Track match history to prevent duplicates
6. Monitor match acceptance rates for threshold adjustment

---

## Environment Variables Checklist

### Required for Production
- [x] VITE_SUPABASE_URL (public)
- [x] VITE_SUPABASE_ANON_KEY (public)
- [x] SUPABASE_SERVICE_ROLE_KEY (Vercel only)
- [x] RESEND_API_KEY (Vercel only)

### NOT in repo (good)
- [x] GOOGLE_PRIVATE_KEY
- [x] Google Sheets credentials
- [x] Service role key

---

## RLS Policies Summary

### SELECT (Matches)
```
Users can see: Their own matches only
Status: ✓ GOOD
Policy: user_id = auth.uid() OR matched_user_id = auth.uid()
```

### INSERT (Matches)
```
Users can insert: ANYTHING (WITH CHECK (true))
Status: ✗ CRITICAL BUG
Should be: System only or WITH CHECK (false)
```

### UPDATE (Matches)
```
Users can update: Their own matches only
Status: ✓ GOOD
Policy: Both directions allowed for acceptance
```

### DELETE (Matches)
```
Users can delete: Not allowed (default deny)
Status: ✓ GOOD
```

---

## Algorithm Thresholds

- **Minimum to show:** 70/100 compatibility
- **Gender override:** 80%+ shows match even if preference mismatch
- **Safety net trigger:** < 40% with 100+ user pool
- **Beta settings:** 60% minimum, 5 matches per user

---

## How Matching Works (User Journey)

```
1. User signs up
   ↓
2. [MISSING] Automatic matching on signup
   (Currently manual or external trigger)
   ↓
3. Algorithm calculates:
   - Organizations (50%)
   - Networking Goals (25%)
   - Professional Interests (15%)
   - Industry (5%)
   - Gender/Age/Personal (5% split)
   ↓
4. Scores >= 70% show in "Recommended" tab
   ↓
5. User clicks "Connect" button
   ↓
6. Email sent to recipient via Resend
   ↓
7. Recipient accepts/declines
   ↓
8. Status: 'connected' or back to 'recommended'
   ↓
9. Monday reset: 'saved' → 'recommended' after 7 days
                 'pending' → 'recommended' after 10 days
```

---

## File Locations Quick Map

```
Matching Algorithm:
  /src/lib/matchingAlgorithm.js          [Core logic]
  /src/lib/generateSupabaseMatches.js    [Node.js script]

API Endpoints:
  /api/run-matching.js                   [MAIN - SECURITY ISSUE]
  /api/resetConnections.js               [Cron - scheduled]
  /api/sendConnectionEmail.js            [Email delivery]

Frontend:
  /src/components/Connections.jsx        [Match UI]
  /src/components/ConnectionCard.jsx     [Individual match]

Database:
  /create-matches-table.sql              [Schema]
  /fix-rls-update-policy.sql             [Current RLS]

Config:
  /vercel.json                           [Cron schedule]
  /.env                                  [Public credentials]

Docs:
  /MATCHING_ALGORITHM_SUMMARY.md         [Design doc]
  /MATCHING_POLICY.md                    [Policy doc]
  /MATCHING_SYSTEM_ANALYSIS.md           [This analysis]
```

---

## Decision: Which Implementation to Use?

**For Production:** Vercel API endpoint + Vercel Cron

**Why:**
- Deployed on same platform (Vercel)
- Automatic scheduling built-in
- Service role key stored in Vercel env (secure)
- No local script dependencies

**Steps:**
1. Update `/api/run-matching.js` to use SERVICE ROLE KEY
2. Add to vercel.json cron schedule
3. Fix RLS INSERT policy
4. Deploy

---

## Testing the Fix

### Test that INSERT is now restricted:
```javascript
// This should FAIL after fix (good!)
const supabase = createClient(
  url,
  anonKey  // Regular user
);

supabase.from('matches').insert({
  user_id: 'fake-id',
  matched_user_id: 'fake-id'
  // Should get RLS error
});

// This should SUCCEED (system operations)
const supabase = createClient(
  url,
  serviceRoleKey  // Admin key
);

supabase.from('matches').insert({
  user_id: 'real-user-id',
  matched_user_id: 'other-user-id'
  // Should work - service role bypasses RLS
});
```

---

## Performance Notes

- **O(n²) algorithm:** 1000 users = 1M comparisons
- **Runs in Node.js:** Fast, takes ~30 seconds per run
- **Not scheduled:** Needs manual trigger or external scheduler
- **No incremental:** Recalculates all matches every time (wasteful)

**Future optimization:** Only calculate for new users, cache for others

---

## User Communication

When implementing matching:
1. Clearly show compatibility scores (70-100%)
2. Explain matching criteria (organizations, goals, interests)
3. Show why they matched: "Both attend BudE events"
4. Let users decline/save/connect at their pace
5. Reset saved connections Monday morning (automatic)

---

## Summary

The matching system is **complete and functional** but has **critical security issues** that must be fixed before production:

1. INSERT policy is too permissive
2. API endpoint uses wrong credential type
3. No automatic scheduling

**Time to fix:** ~1 hour  
**Risk if not fixed:** Users can insert fake matches  
**Next review:** After 100+ users or quarterly

---

**For detailed analysis, see: MATCHING_SYSTEM_ANALYSIS.md**

