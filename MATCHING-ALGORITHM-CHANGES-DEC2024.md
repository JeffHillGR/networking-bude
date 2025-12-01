# Matching Algorithm Rebalancing - December 2024

## Problem
- 19 out of 45 users (42%) had zero matches
- Organizations (30 pts) was too heavily weighted
- Newcomers to networking often don't know which organizations to join yet
- Personal interests had high completion rate but only 5 points

## Solution
Rebalanced scoring to favor fields that newcomers fill out (personal interests, goals) over fields that require existing networking experience (organizations, groups).

## Score Changes (Dec 1 - Final)

| Category | OLD | CURRENT | Rationale |
|----------|-----|---------|-----------|
| Networking Goals | 25 | **30** | Boost - their "why" is most important |
| Organizations | 30 | **25** | 12.5 complementary + 12.5 same-field |
| Professional Interests | 15 | **20** | Boost - professional alignment matters |
| Personal Interests | 5 | **15** | Moderate - builds rapport but not over-weighted |
| Industry | 5 | **10** | Boost - same/related industry helps |
| Looking To | 12.5 | **0** | DISABLED - blank for most users (reinstate later) |
| Groups | 12.5 | **0** | DISABLED - blank for most users (reinstate later) |

**Current Total:** 100 points (exactly)

## Threshold
Set to **60%** minimum to show as potential connection.

## Additional Changes
- Expanded hobby keywords list for personal interests matching
- Personal interests: 7 pts for 1 shared hobby, 15 pts for 2+ shared hobbies
- Organizations bucket split: 12.5 pts complementary, 12.5 pts same-field

## Files Modified
- `src/lib/matchingAlgorithm.js`
- `supabase/functions/run-matching/index.ts` (Edge Function)

## History
1. ~~Push changes to trigger Vercel deploy~~ ✓
2. ~~Re-run matching algorithm~~ ✓
3. ~~Check matches~~ - went from 90 to 94 records
4. ~~Adjust threshold to 55%~~ ✓ then back to 60%
5. ~~Fixed Edge Function~~ ✓ - was using wrong scoring (old Gender/Age preferences)
6. ~~Disabled Groups & LookingTo~~ ✓ - Dec 1 - fields blank, causing 38 records instead of ~120

## TODO (Future)
- [ ] Reinstate Groups scoring (10 pts) when users have filled in `groups_belong_to`
- [ ] Reinstate LookingTo scoring (15 pts) when users have filled in `looking_to_accomplish`
- [ ] Rebalance other categories down by 25 pts total when reinstating
