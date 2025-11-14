# BudE Matching Algorithm Policy

**Version:** 1.0
**Last Updated:** October 26, 2025
**Review Schedule:** Quarterly (or as needed based on user feedback)

---

## Core Philosophy

**Quality over Quantity**: Users should receive 5-10% of total user base as matches (approximately 1-3 matches per user in a pool of 28 users, scaling proportionally).

**Threshold**: 70% compatibility score minimum to be shown as a potential match.

---

## Scoring Weights

### Primary Categories (Total: 100%)

1. **Networking Goals (25%)**
   - Keywords: "meaningful connections" (+18 points both, +8 one)
   - Keywords: "grow", "growth", "expand" (+12 points both, +5 one)
   - Sales-focused users: "find clients", "sell services", "business development" (+18 points when both sales-focused)
   - General shared keywords: +2 points each (max 8 points)

2. **Organizations (50%)**
   - **Bucket 1 - Complementary Match (25 points):**
     - My "Orgs I Attend" ↔ Your "Orgs I Want to Check Out"
     - OR Your "Orgs I Attend" ↔ My "Orgs I Want to Check Out"
   - **Bucket 2 - Same-Field Match (25 points):**
     - Both attend same organizations
     - OR Both want to check out same organizations

3. **Professional Interests (15%)**
   - Shared interests scored proportionally: (shared / average list length) × 15

4. **Industry (5%)**
   - Exact match: 5 points
   - Related industries: 3 points

5. **Gender Preference (2.5%)**
   - Compatible preferences: 2.5 points
   - No preference: 2.5 points (default)

6. **Age Preference (2.5%)**
   - Within preferred range: 2.5 points
   - No preference: 2.5 points (default)

7. **Personal Interests/Hobbies (5%)**
   - Shared hobbies: +2 points each (max 5 points)

---

## User Engagement Strategy

### Profile Completion Prompts

**Scenario:** User has no matches after 48-72 hours

**Trigger Conditions:**
- User completed onboarding 48-72 hours ago
- User has 0 matches above 70% threshold
- User hasn't been shown profile improvement prompt yet

**Action:**
Display prominent message:
> "No Suggested Connections Yet? Add more to your profile to expand your network"

**Prompt Should Include:**
- Link to edit profile
- Specific suggestions based on what's missing:
  - ❌ No networking goals → "Share what you're looking for in networking"
  - ❌ No organizations → "Add organizations you attend or want to explore"
  - ❌ Minimal professional interests → "Add more professional interests"
  - ❌ Empty personal interests → "Share your hobbies to find common ground"

**Best Practices:**
- Show prompt as banner in Connections tab
- Make it dismissible but show again after 7 days if still no matches
- Track engagement with prompt to measure effectiveness
- Consider email follow-up after 7 days if no profile updates

---

## Exception Rules

### Exception #1: Gender Preference Override (80%+ Rule)

**Future Consideration:** May lower threshold to 75% based on data
- Current: 80%+ triggers override
- Monitor: If we see 75-79% exceptional matches being blocked
- Adjust: Could lower to 75% after reviewing user feedback

**Rule:** If a user has specified a gender preference, their preference should be **honored by default**. HOWEVER, if a potential match scores **80% or higher compatibility**, they should be shown **regardless of gender preference mismatch**.

**Rationale:**
- Respect user preferences as the default behavior
- Allow for exceptional connections that might not have been anticipated
- User maintains final decision to accept or decline
- 80%+ compatibility is rare and valuable enough to warrant the exception

**Implementation:**
```javascript
// Pseudo-code
if (compatibilityScore >= 80) {
  showMatch = true; // Override gender preference
  flagAsExceptionalMatch = true; // Show special indicator
} else if (genderPreferenceMismatch) {
  showMatch = false; // Honor preference
} else {
  showMatch = (compatibilityScore >= 70); // Standard threshold
}
```

**User Experience:**
- Matches shown via 80% rule should include a badge: "Exceptional Match - 80%+ Compatible"
- Optional explanation: "We typically honor your gender preference, but this person's compatibility with you is exceptional."

---

### Exception #2: Low Match Safety Net (Network Expansion Rule)

**Rule:** If a user scores **below 40% with a very large group of users** (defined as 100+ users in the database), they should be offered **1-2 connection suggestions based on minimal shared attributes**.

**Threshold Conditions:**
- User pool: 100+ active users
- User's highest match score: Below 40%
- Trigger: After initial matching run shows no matches above 70%

**Matching Criteria for Safety Net:**
- Match on **1-2 basic attributes only**:
  - Same Professional Interest (most likely)
  - Same Industry (most likely)
  - OR Same Organization attendance
- Do NOT require 70% threshold
- Show maximum of 2 suggestions per bi-weekly cycle

**Rationale:**
- Prevents users from feeling isolated or unsupported
- Generic professional interests/industries provide low-risk connection opportunities
- Acknowledges that SOME connection is better than NO connection
- Encourages profile improvement over time

**User Experience:**
- Different visual treatment: "Expand Your Network" section (separate from main matches)
- Messaging: "Based on your [Professional Interest/Industry], you might connect with:"
- Include prompt to update profile: "Want more personalized matches? Update your profile to include:"
  - Networking goals with more detail
  - Organizations you attend or want to explore
  - More specific professional interests

**Example Implementation:**
```javascript
// Pseudo-code
if (userPool.size >= 100 && user.highestMatchScore < 40) {
  // Find 1-2 matches based on single shared attribute
  const safetyNetMatches = findBasicMatches(user, {
    maxResults: 2,
    criteria: ['professionalInterests', 'industry', 'organizations'],
    minSharedAttributes: 1
  });

  displayAsNetworkExpansion(safetyNetMatches);
  promptProfileImprovement(user);
}
```

---

## Data-Driven Observations (Beta Testing - 28 Users)

### Results from Real Beta Users:
- **Total unique pairings:** 378
- **Matches above 70%:** 19 (5.0%) ✅ **Perfect target range**
- **Average matches per user:** 1.4
- **Users with at least 1 match:** 17/28 (60.7%)

### Top Scoring Category:
**Organizations (50%)** - All top 5 matches scored 50/50 on Organizations, validating this as the strongest matching factor.

### Key Insight:
Users who expressed **vulnerability and specificity** in their networking goals (e.g., "awkward", "don't like going alone", "pay to play frustrations") had higher match rates.

---

## Matching Cadence

**Bi-weekly refresh cycle:**
- New matches calculated every 2 weeks
- Connection history tracked to prevent showing same suggestions repeatedly
- Users receive 5-10 new potential connections per cycle (when available)

---

## Algorithm Transparency

**What Users Know:**
- Matching is based on networking goals, organizations, professional interests, and other profile factors
- Algorithm emphasizes quality over quantity
- Matching algorithm details remain proprietary (kept on backend)

**What Users See:**
- Compatibility percentage (e.g., "79% compatible")
- **Highlighted matching fields** in lime green (#D0ED00) on profile cards
- Top matching reasons (e.g., "Both attend: GR Chamber of Commerce")

---

## Profile Guidance for Better Matches

**Encourage vulnerability and specificity in:**

1. **Networking Goals** - Instead of generic responses like "build my network", prompt for:
   - What frustrates you about networking?
   - What would make networking easier for you?
   - Example pain points: "Feeling awkward", "Events feel transactional", "Don't want to go alone", "Seeking meaningful connections"

2. **Organizations** - Both fields matter:
   - Organizations you currently attend
   - Organizations you want to check out (creates introduction opportunities!)

3. **Professional Interests** - Be specific rather than broad

---

## Future Considerations

### Items to Monitor & Review Quarterly:

1. **Gender Preference Override Threshold**
   - Current: 80%+
   - Monitor: User acceptance rate of 80%+ opposite-gender matches
   - Consider: Beta data showed some 75-79% cross-gender matches that could be exceptional
   - Adjust: May decrease to 75% or even 70% based on user feedback and acceptance rates
   - Note: Lower threshold = more exceptions, but could create great unexpected connections

2. **Safety Net Activation Threshold**
   - Current: 40% max score in 100+ user pool
   - Monitor: User engagement with safety net matches
   - Adjust: May change to 35% or 45% based on feedback

3. **Organization Weight**
   - Current: 50% (25% complementary + 25% same-field)
   - Monitor: Continues to be strongest driver of top matches
   - Consider: May adjust split between complementary vs same-field

4. **Networking Goals Keyword Detection**
   - Current: Manual keyword list
   - Future: May implement NLP for better pain point detection
   - Add: New keywords based on common user responses

5. **Professional Interests Scoring**
   - Current: Proportional to average list length
   - Monitor: Are matches with many shared interests higher quality?
   - Consider: Bonus points for 3+ shared interests

---

## Testing & Validation

### Before Major Algorithm Changes:

1. Run matching algorithm on current user base
2. Generate compatibility matrix
3. Compare to previous results
4. Review edge cases (users with no matches, users with many matches)
5. Validate against "quality over quantity" principle (5-10% match rate)

### Metrics to Track:

- Average matches per user
- Percentage of users with 0 matches
- Percentage of users with 5+ matches
- Distribution of compatibility scores
- User acceptance rate of matches
- User feedback on match quality

---

## Change Log

### Version 1.0 (October 26, 2025)
- Initial policy documentation
- Established 70% base threshold
- Added 80%+ gender preference override rule
- Added sub-40% safety net rule for 100+ user pools
- Set quarterly review schedule
- Validated organization scoring as 50% weight (25% complementary + 25% same-field)

---

## Contact

**Algorithm Owner:** Jeff Hill (grjeff@gmail.com)
**Review Board:** TBD (establish as user base grows)
**Next Scheduled Review:** January 26, 2026
