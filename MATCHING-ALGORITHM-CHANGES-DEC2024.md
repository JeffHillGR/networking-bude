# Matching Algorithm Rebalancing - December 2024

## Problem
- 19 out of 45 users (42%) had zero matches
- Organizations (30 pts) was too heavily weighted
- Newcomers to networking often don't know which organizations to join yet
- Personal interests had high completion rate but only 5 points

## Solution
Rebalanced scoring to favor fields that newcomers fill out (personal interests, goals) over fields that require existing networking experience (organizations, groups).

## Score Changes

| Category | OLD | NEW | Rationale |
|----------|-----|-----|-----------|
| Networking Goals | 25 | 25 | Keep - their "why" is important |
| Personal Interests | 5 | **20** | Boost - high completion rate, builds rapport |
| Organizations | 30 | **20** | Cut - penalizes newcomers who don't know orgs yet |
| Looking To | 12.5 | **15** | Boost - accessible goal alignment |
| Professional Interests | 15 | 15 | Keep - professional alignment matters |
| Groups | 12.5 | **10** | Cut - new field, will be blank for most |
| Industry | 5 | 5 | Keep low - focus groups said same-industry not desired |

**Old Total:** 105 (capped at 100)
**New Total:** 110 (capped at 100)

## Threshold
Kept at **60%** minimum to show as potential connection.

## Additional Changes
- Expanded hobby keywords list for personal interests matching
- Personal interests now gives 10 pts for 1 shared hobby, 20 pts for 2+ shared hobbies
- Organizations bucket split: 10 pts complementary, 10 pts same-field (was 15/15)

## Files Modified
- `src/lib/matchingAlgorithm.js`

## Next Steps
1. Push changes to trigger Vercel deploy
2. Re-run matching algorithm (triggered by profile update or edge function)
3. Check how many users now have matches
4. Adjust threshold to 55% if still too many with zero matches
