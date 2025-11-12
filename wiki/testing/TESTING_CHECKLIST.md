# BudE Beta Testing Checklist

## 🎯 Testing Goal
Ensure beta users focus on **value and package** without getting bogged down in navigation or look/feel issues.

---

## ✅ Pre-Testing Setup
- [ ] Open Chrome Incognito Window (Ctrl+Shift+N) or Private Window in Safari
- [ ] Go to: http://localhost:5173 (or your Vercel URL)
- [ ] Open DevTools (F12) and keep Console tab visible
- [ ] Have a notepad ready for notes

---

## 1️⃣ ONBOARDING FLOW (Critical Path)

### Test: Happy Path
- [ ] Page loads without errors
- [ ] All form fields visible and labeled
- [ ] "Get Started" button works
- [ ] Can fill out each step:
  - [ ] First Name, Last Name, Email
  - [ ] Job Title (placeholder: "Or what you are known for")
  - [ ] Company
  - [ ] Industry dropdown
  - [ ] Gender (optional)
  - [ ] Date of Birth (optional)
  - [ ] Zip Code
  - [ ] Professional Interests (including "Coding" and "AI")
  - [ ] Organizations (including "Crain's GR Business")
  - [ ] Networking Goals
- [ ] Can navigate forward/backward through steps
- [ ] Progress indicator updates correctly
- [ ] Final "Complete" button works
- [ ] Lands on Dashboard after completion

### Test: Error Cases
- [ ] Try submitting with empty required fields → Shows error
- [ ] Try invalid email format → Shows error
- [ ] Try very long text in fields → Handles gracefully
- [ ] Special characters in text fields (', ", <, >) → Works
- [ ] Refresh page mid-onboarding → Doesn't crash

### Test: Mobile Experience
- [ ] Switch to mobile view (Chrome DevTools → Toggle Device Toolbar)
- [ ] Forms don't zoom in awkwardly
- [ ] All text is readable (16px minimum)
- [ ] Can scroll through all steps
- [ ] Buttons are tappable (not too small)

**Expected Value Prop:** "This onboarding collects my professional info to match me with relevant connections"

---

## 2️⃣ DASHBOARD EXPERIENCE (First Impression)

### Test: Three Core Value Props Are Clear
- [ ] **"Featured Content"** - Heading is prominent (text-lg, bold)
- [ ] **"Potential Connections"** - Heading is prominent (text-lg, bold)
- [ ] **"Upcoming Events"** - Heading is prominent (text-lg, bold)
- [ ] Descriptive text under each heading is readable
- [ ] All three sections load with content
- [ ] Carousel works on Featured Content (left/right arrows)
- [ ] "View All Connections" button visible and styled
- [ ] "View All Events" button visible and styled

### Test: Navigation
- [ ] Sidebar on desktop shows all menu items
- [ ] Bottom nav on mobile shows all tabs
- [ ] Clicking "Events" navigates to Events page
- [ ] Clicking "Connections" shows beta message
- [ ] Clicking "Messages" shows beta message
- [ ] Clicking "Profile" goes to Settings
- [ ] BudE logo visible and positioned correctly

### Test: Data Persistence
- [ ] Greeting shows correct first name
- [ ] Refresh page → Data persists
- [ ] Navigate away and back → Data persists

**Expected Value Prop:** "I can see featured content, potential connections, and upcoming events — the 3 core values"

---

## 3️⃣ EVENTS PAGE

### Test: Event Listings
- [ ] Featured events section visible
- [ ] "More Events" section visible
- [ ] All 4 featured events display:
  - [ ] Salim Ismail event (10/20)
  - [ ] OutPro Forum (10/22)
  - [ ] Jay & Betty Van Andel Gala (11/12)
  - [ ] Place Matters Summit (11/6)
- [ ] UNFILTERED event has trending indicator (red badge, green border)
- [ ] All events show: title, date, time, location, organizer
- [ ] "Coming Soon" text appears (NOT "Number Attending - Beta Coming Soon")
- [ ] Event images load correctly
- [ ] "View Details" buttons work

### Test: Event Detail Page
- [ ] Clicking event opens detail page
- [ ] All event info displays correctly
- [ ] "Back to Events" button works (navigate(-1))
- [ ] "Attendees" label (NOT "Number Attending")
- [ ] "Coming Soon" text (NOT "Beta coming soon")
- [ ] Event images display properly
- [ ] Can navigate back and forth between events

### Test: Submit Event Form
- [ ] "Suggest an Event" button visible
- [ ] Modal opens when clicked
- [ ] Form has 3 fields: Name, Email, Event URL
- [ ] All fields are required
- [ ] Can fill out and submit
- [ ] Success message shows: "Thank you for submitting. We'll check it out."
- [ ] Success message has green checkmark icon
- [ ] Modal closes after 3 seconds
- [ ] Form resets after submission

**Expected Value Prop:** "I can discover local networking events happening in Grand Rapids"

---

## 4️⃣ AD INQUIRY FORMS (3 Locations)

### Test: Dashboard Ad Inquiry
- [ ] Banner ad placeholder visible at bottom
- [ ] Clicking banner opens ad inquiry modal
- [ ] Modal has BudE branding (green background, yellow border)

### Test: Events Page Ad Inquiry
- [ ] "Interested in advertising?" section visible
- [ ] Clicking opens ad inquiry modal

### Test: Event Detail Ad Inquiry
- [ ] Ad inquiry section visible
- [ ] Clicking opens ad inquiry modal

### Test: Form Functionality (Test in ONE location)
- [ ] Form fields: Name*, Email*, Company, Phone, Ad Type, Message
- [ ] Phone number auto-formats as (XXX) XXX-XXXX while typing
- [ ] Can paste phone number and it formats correctly
- [ ] Ad Type dropdown includes:
  - [ ] Dashboard Banner
  - [ ] Events Page Sidebar
  - [ ] Events Page Banner
  - [ ] Event Detail Banner
  - [ ] Sponsored Event
  - [ ] Sponsored Content
  - [ ] Multiple Placements
- [ ] Submit with valid data → Success
- [ ] Success message: "Thank You! Your inquiry has been submitted successfully. We'll be in touch soon!"
- [ ] Green checkmark icon appears
- [ ] Modal closes after 3 seconds
- [ ] Data appears in Google Sheets (optional check)

### Test: Error Cases
- [ ] Submit with empty required fields → Shows error
- [ ] Submit with invalid email → Shows error
- [ ] Submit with invalid phone (letters) → Handles gracefully
- [ ] Double-click submit button → Only submits once (disabled state)

**Expected Value Prop:** "I can easily inquire about advertising opportunities"

---

## 5️⃣ FEEDBACK SYSTEM

### Test: Floating Feedback Widget
- [ ] Tab attached to bottom right of screen
- [ ] Green background (#009900) with light green border (#D0ED00)
- [ ] Rounded top corners only (looks like a tab)
- [ ] Shows "FEEDBACK" text on desktop
- [ ] Shows icon only on mobile
- [ ] Visible on ALL pages (Dashboard, Events, Event Detail, Settings)
- [ ] Slight lift animation on hover

### Test: Intermediate Feedback Screen
- [ ] Clicking widget opens intermediate modal
- [ ] Modal shows: "How's your BudE experience so far?"
- [ ] Two buttons: "Give Feedback" and "Maybe Later"
- [ ] Modal STAYS OPEN until user clicks a button (no auto-dismiss)
- [ ] Yellow border on modal
- [ ] Green message bubble icon

### Test: Feedback Form
- [ ] Clicking "Give Feedback" opens full form
- [ ] Form opens in Settings page
- [ ] Form has all sections:
  - [ ] Name* and Email* fields
  - [ ] Onboarding & First Impressions
  - [ ] User Experience (UX)
  - [ ] Design & Branding
  - [ ] Performance & Speed
  - [ ] Features & Functionality
  - [ ] Value Proposition & Relevance
  - [ ] Overall Satisfaction
- [ ] **Overall Rating** shows 10 clickable buttons (1-10)
- [ ] **Net Promoter Score** shows 11 clickable buttons (0-10)
- [ ] Clicking number button selects it (green background, yellow border)
- [ ] Can fill out all fields
- [ ] Submit button works
- [ ] Success message: "Thank You! Your feedback has been submitted successfully. This helps us make BudE better for everyone!"
- [ ] Green checkmark appears
- [ ] Modal stays open for 3 seconds then closes
- [ ] Data goes to Google Sheets (optional check)

### Test: 24-Hour Auto-Prompt
- [ ] After 24 hours of usage, feedback prompt auto-appears (hard to test manually)

**Expected Value Prop:** "I can easily give feedback to help improve the platform"

---

## 6️⃣ SETTINGS/PROFILE

### Test: Profile Editing
- [ ] Navigate to Profile/Settings
- [ ] Can view profile information
- [ ] Can edit: Name, Email, Job Title, Company, Location, Industry
- [ ] Can edit Professional Interests (tags)
- [ ] Can edit Organizations
- [ ] "Save Changes" button works
- [ ] Success message appears
- [ ] Refresh page → Changes persist

### Test: Privacy Tab
- [ ] Beta message visible: "During Beta testing phase, your provided personal profile data is stored unencrypted in your browser to simulate a logged in status. Privacy settings coming soon."
- [ ] Message styled with green theme
- [ ] Privacy toggle switches visible but disabled
- [ ] "Give Feedback" button opens feedback form

### Test: Leave Beta
- [ ] "Leave Beta" button in Danger Zone
- [ ] Clicking opens confirmation modal
- [ ] Can enter reason for leaving (optional)
- [ ] Warning message visible
- [ ] "Cancel" button works
- [ ] "Leave Beta" button clears localStorage and redirects to onboarding

**Expected Value Prop:** "I have control over my profile data during beta"

---

## 7️⃣ MOBILE-SPECIFIC TESTS

### Test on Actual Mobile Device (If Possible)
- [ ] Visit site on iPhone Safari or Android Chrome
- [ ] Onboarding doesn't zoom in awkwardly
- [ ] All forms are usable
- [ ] Phone number formatting works on mobile
- [ ] Rating buttons (1-10, 0-10) are tappable
- [ ] Modals are scrollable
- [ ] Bottom navigation doesn't overlap content
- [ ] Feedback widget doesn't interfere with navigation
- [ ] Can complete full flow: Onboarding → Dashboard → Submit Ad Inquiry

### Test in Chrome DevTools Mobile Mode
- [ ] Switch to iPhone 12 Pro
- [ ] Test portrait and landscape modes
- [ ] All buttons are large enough (48x48px minimum)
- [ ] Text is readable without zooming
- [ ] No horizontal scrolling
- [ ] Images load and scale properly

---

## 8️⃣ EDGE CASES & STRESS TESTS

### Test: Network Issues
- [ ] Chrome DevTools → Network tab → "Slow 3G"
- [ ] Pages still load (even if slow)
- [ ] Loading states appear on form submissions
- [ ] Error messages are user-friendly (no technical jargon)

### Test: Rapid Clicking
- [ ] Double-click "Submit" button rapidly → Only submits once
- [ ] Button shows loading state
- [ ] Button is disabled during submission

### Test: Special Characters
- [ ] Enter special characters in text fields: ', ", <, >, &, @, #, $
- [ ] Forms handle them gracefully
- [ ] No JavaScript errors in console

### Test: Very Long Text
- [ ] Enter 1000+ characters in message fields
- [ ] Form accepts it
- [ ] Submission doesn't fail
- [ ] No layout breaking

### Test: Browser Refresh
- [ ] Fill out form halfway
- [ ] Refresh page
- [ ] Form data is lost (expected for beta)
- [ ] No errors or crashes

### Test: Navigation During Form Fill
- [ ] Fill out form halfway
- [ ] Navigate away (click different tab)
- [ ] Come back
- [ ] Form is reset (expected)

---

## 9️⃣ CONSOLE ERRORS CHECK

### After Each Test Session:
- [ ] Check browser console (F12 → Console tab)
- [ ] Look for red errors
- [ ] Note any warnings (yellow)
- [ ] Screenshot any errors for debugging

**Common Issues to Watch For:**
- "Failed to fetch" → API endpoint issue
- "Cannot read property of undefined" → JavaScript error
- "CORS error" → Backend configuration issue
- 404 errors → Missing files or routes
- 500 errors → Server-side issues

---

## 🔟 CROSS-BROWSER TESTING (If Time Permits)

### Test in Different Browsers:
- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari (Mac only)
- [ ] Edge
- [ ] Mobile Safari (iPhone)
- [ ] Mobile Chrome (Android)

**Look For:**
- Different font rendering
- Button styling differences
- Form behavior differences
- Modal positioning issues

---

## 📊 AFTER TESTING: WHAT TO REPORT

### High Priority Issues (Beta Blockers):
- Forms don't submit
- Data doesn't persist
- Navigation is broken
- Console shows critical errors
- Mobile is unusable

### Medium Priority Issues:
- Minor styling inconsistencies
- Slow load times
- Awkward UX flows
- Confusing labels

### Low Priority Issues (Post-Beta):
- Nice-to-have features
- Minor text changes
- Small design tweaks

---

## 🎯 FOCUS AREAS FOR BETA TESTERS

Remind your beta testers to focus on:

1. **Value Proposition**: Do they understand what BudE does?
2. **Core Features**: Can they find connections, events, and content?
3. **Ease of Use**: Is navigation intuitive?
4. **Would They Use It**: Does it solve a real problem?

NOT focus on:
- Minor design details
- Missing features (you'll add those later)
- Beta-specific limitations (like localStorage)

---

## 📝 NOTES SECTION

Use this space to jot down issues during testing:

**Bugs Found:**
1.
2.
3.

**UX Improvements:**
1.
2.
3.

**Questions for Users:**
1.
2.
3.

---

## ✅ FINAL CHECK BEFORE BETA LAUNCH

- [ ] All critical forms submit successfully
- [ ] Data persists across page refreshes
- [ ] Mobile experience is smooth
- [ ] No console errors on happy path
- [ ] Ad inquiries reach Google Sheets
- [ ] Feedback form reaches Google Sheets
- [ ] Event suggestions reach Google Sheets
- [ ] Three value props are prominent on dashboard
- [ ] Feedback widget works on all pages

---

**Time Estimate:** 45-60 minutes for thorough testing

**Best Practice:** Test in incognito mode for each major flow to simulate fresh user experience.
