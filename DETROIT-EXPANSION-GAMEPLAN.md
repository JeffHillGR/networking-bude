# Detroit Expansion Game Plan

## Overview
Expand BudE from Grand Rapids-only to support Detroit (and future markets) while keeping Connections, Insights, and core functionality unchanged. Events are location-specific.

---

## What Stays The Same
- Matching algorithm (location-agnostic already)
- Connection flow & insights
- User profiles (structure)
- Auth system
- Core UI/UX

## What Changes

### Phase 1: Database Schema (Foundation)

**1.1 Add `regions` config table**
```sql
CREATE TABLE public.regions (
  id TEXT PRIMARY KEY,           -- 'grand-rapids', 'detroit'
  name TEXT NOT NULL,            -- 'Grand Rapids', 'Detroit'
  display_name TEXT NOT NULL,    -- 'Grand Rapids, MI', 'Detroit Metro'
  state TEXT NOT NULL,           -- 'MI'
  zip_prefixes TEXT[],           -- ['495', '493'] for GR, ['481', '482', '483'] for Detroit
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**1.2 Add `organizations` table (replace hardcoded array)**
```sql
CREATE TABLE public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region_id TEXT REFERENCES public.regions(id),
  category TEXT,                 -- 'chamber', 'professional', 'networking', etc.
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);
```

**1.3 Add `region` column to users table**
```sql
ALTER TABLE public.users ADD COLUMN region TEXT REFERENCES public.regions(id);
```

**1.4 Add `region` to events table** (if not already)
```sql
ALTER TABLE public.events ADD COLUMN region_id TEXT REFERENCES public.regions(id);
```

---

### Phase 2: Onboarding Flow Changes

**Current flow (3 steps):**
- Step 0 (Page 1): Name, Email, Password
- Step 1 (Page 2): Job Title, Company, Zip Code, Industry, Organizations, Groups, Professional Interests
- Step 2 (Page 3): Personal Interests, "I'm looking to...", Networking Goals, Photo → Submit

**New flow (rebalanced):**
- Step 0 (Page 1): Name, Email, Password *(unchanged)*
- Step 1 (Page 2): Job Title, Company, **Zip Code**, Industry, Groups, **"I'm looking to..."** *(moved up)*, Professional Interests
- Step 2 (Page 3): **Organizations** *(moved here, filtered by zip)*, Personal Interests, Networking Goals, Photo → Submit

**Why this balance works:**
- Page 2 = "About You" (job, location, interests, goals)
- Page 3 = "Your Community" (orgs based on your location) + personal touch

**Key insight:** No auth user exists until final submit. Region detection + org filtering happens entirely in client-side state (`formData`).

**Files to modify:**
- `src/components/OnboardingFlow.jsx`
  - Lines 158-164: Replace hardcoded `organizations` array with REGIONS config
  - Lines 1328-1389: Move Organizations UI from Step 1 → Step 2
  - Lines 1569-1595: Move "I'm looking to..." dropdown from Step 2 → Step 1
  - Add `region` to formData state
  - Add region detection on zip code change

**Region Detection Logic (client-side, no DB needed):**
```javascript
// Add to formData state
const [formData, setFormData] = useState({
  // ... existing fields
  region: '',  // NEW: auto-detected from zip
});

// Region config with full zip code lists (Option 1: pre-computed)
const REGIONS = {
  'grand-rapids': {
    name: 'Grand Rapids',
    hubZip: '49503',
    // All zips in 493, 494, 495 prefixes (~50 mile coverage)
    zipCodes: [
      // 493xx - Grand Rapids metro & north
      '49301', '49302', '49303', '49304', '49305', '49306', '49307', '49309', '49310', '49312',
      '49315', '49316', '49318', '49319', '49320', '49321', '49322', '49323', '49325', '49326',
      '49327', '49328', '49329', '49330', '49331', '49332', '49333', '49335', '49336', '49337',
      '49338', '49339', '49340', '49341', '49342', '49343', '49344', '49345', '49346', '49347',
      '49348', '49349',
      // 494xx - Holland, Muskegon, lakeshore
      '49401', '49402', '49403', '49404', '49405', '49406', '49408', '49409', '49410', '49411',
      '49412', '49415', '49417', '49418', '49419', '49420', '49421', '49423', '49424', '49425',
      '49426', '49428', '49429', '49430', '49431', '49434', '49435', '49436', '49437', '49440',
      '49441', '49442', '49443', '49444', '49445', '49446', '49448', '49449', '49450', '49451',
      '49452', '49453', '49454', '49455', '49456', '49457', '49458', '49459', '49460', '49461',
      '49464',
      // 495xx - Grand Rapids city
      '49503', '49504', '49505', '49506', '49507', '49508', '49509', '49512', '49519', '49525',
      '49534', '49544', '49546', '49548'
    ],
    organizations: [
      'GR Chamber of Commerce', 'Rotary Club', 'CREW', 'GRYP',
      'Economic Club of Grand Rapids', 'Create Great Leaders', 'Right Place', 'Bamboo GR',
      'Hello West Michigan', 'CARWM', 'Creative Mornings GR', 'Athena',
      'Inforum', 'Start Garden', 'GRABB', 'WMPRSA', "Crain's GR Business", 'AIGA - WM',
      'West Michigan Hispanic Chamber of Commerce'
    ]
  },
  'detroit': {
    name: 'Detroit',
    hubZip: '48243',
    // All zips in 480, 481, 482, 483 prefixes (~50 mile coverage)
    zipCodes: [
      // 480xx - Macomb County, St Clair
      '48001', '48002', '48003', '48004', '48005', '48006', '48007', '48009', '48012', '48014',
      '48015', '48017', '48021', '48022', '48023', '48025', '48026', '48027', '48028', '48030',
      '48032', '48033', '48034', '48035', '48036', '48037', '48038', '48039', '48040', '48041',
      '48042', '48043', '48044', '48045', '48046', '48047', '48048', '48049', '48050', '48051',
      '48054', '48055', '48059', '48060', '48061', '48062', '48063', '48064', '48065', '48066',
      '48067', '48068', '48069', '48070', '48071', '48072', '48073', '48074', '48075', '48076',
      '48079', '48080', '48081', '48082', '48083', '48084', '48085', '48086', '48088', '48089',
      '48090', '48091', '48092', '48093', '48094', '48095', '48096', '48097', '48098', '48099',
      // 481xx - Ann Arbor, Washtenaw, Monroe
      '48101', '48103', '48104', '48105', '48106', '48107', '48108', '48109', '48110', '48111',
      '48112', '48113', '48114', '48115', '48116', '48117', '48118', '48120', '48121', '48122',
      '48123', '48124', '48125', '48126', '48127', '48128', '48130', '48131', '48133', '48134',
      '48135', '48136', '48137', '48138', '48139', '48140', '48141', '48143', '48144', '48145',
      '48146', '48150', '48151', '48152', '48153', '48154', '48157', '48158', '48159', '48160',
      '48161', '48162', '48164', '48165', '48166', '48167', '48168', '48169', '48170', '48173',
      '48174', '48175', '48176', '48177', '48178', '48179', '48180', '48182', '48183', '48184',
      '48185', '48186', '48187', '48188', '48189', '48190', '48191', '48192', '48193', '48195',
      '48197', '48198',
      // 482xx - Detroit city
      '48201', '48202', '48203', '48204', '48205', '48206', '48207', '48208', '48209', '48210',
      '48211', '48212', '48213', '48214', '48215', '48216', '48217', '48218', '48219', '48220',
      '48221', '48222', '48223', '48224', '48225', '48226', '48227', '48228', '48229', '48230',
      '48231', '48232', '48233', '48234', '48235', '48236', '48237', '48238', '48239', '48240',
      '48242', '48243',
      // 483xx - Oakland County
      '48301', '48302', '48303', '48304', '48306', '48307', '48308', '48309', '48310', '48311',
      '48312', '48313', '48314', '48315', '48316', '48317', '48318', '48320', '48321', '48322',
      '48323', '48324', '48325', '48326', '48327', '48328', '48329', '48330', '48331', '48332',
      '48333', '48334', '48335', '48336', '48340', '48341', '48342', '48343', '48346', '48347',
      '48348', '48350', '48353', '48356', '48357', '48359', '48360', '48361', '48362', '48363',
      '48366', '48367', '48370', '48371', '48374', '48375', '48376', '48377', '48380', '48381',
      '48382', '48383', '48386', '48387', '48390', '48393', '48397'
    ],
    organizations: [
      // Chambers & Business
      'Detroit Regional Chamber', 'Detroit Economic Club', 'Ann Arbor SPARK',
      // Professional Networks
      'Detroit Young Professionals (DYP)', 'Inforum', 'CREW Detroit',
      // Tech & Startup
      'TechTown Detroit', 'Build Institute', 'Bamboo Detroit', 'IT in the D',
      // Industry
      'Automation Alley', 'MICHauto', 'Detroit Mobility Lab',
      // Business Development
      'Goldman Sachs 10KSB Detroit', 'NAWBO Detroit', 'Sunrise Networking Group',
      // Regional Chambers
      'Royal Oak Chamber', 'Ferndale Area Chamber', 'Ann Arbor Chamber'
    ]
  }
};

// Detect region from zip code (checks full 5-digit zip)
const detectRegion = (zipCode) => {
  if (!zipCode || zipCode.length !== 5) return '';

  for (const [regionId, config] of Object.entries(REGIONS)) {
    if (config.zipCodes.includes(zipCode)) {
      return regionId;
    }
  }
  return ''; // Unknown region - show waitlist
};

// In handleChange for zipCode:
const handleZipChange = (value) => {
  const region = detectRegion(value);
  setFormData(prev => ({
    ...prev,
    zipCode: value,
    region: region,
    organizations: [],           // Reset orgs when region changes
    organizationsToCheckOut: []  // Reset these too
  }));
};

// Get orgs for current region
const getOrganizationsForRegion = () => {
  if (!formData.region || !REGIONS[formData.region]) return [];
  return REGIONS[formData.region].organizations;
};
```

**Unsupported Region Handling:**
```javascript
// On Step 2 (Page 3), if region is empty:
{!formData.region && (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
    <p className="text-yellow-800 font-medium">
      BudE is currently available in Grand Rapids and Detroit.
    </p>
    <p className="text-yellow-700 text-sm mt-1">
      We're expanding soon! Join our waitlist to be notified when we launch in your area.
    </p>
    <button className="mt-2 text-[#009900] font-semibold">
      Join Waitlist →
    </button>
  </div>
)}
```

---

### Phase 3: Dynamic Organizations

**3.1 Replace hardcoded org array with Supabase query**

Current (hardcoded):
```javascript
const organizations = ['GR Chamber of Commerce', 'Rotary Club', ...];
```

New (dynamic):
```javascript
const { data: organizations } = await supabase
  .from('organizations')
  .select('id, name')
  .eq('region_id', userRegion)
  .eq('is_active', true)
  .order('sort_order');
```

**Files to modify:**
- `src/components/OnboardingFlow.jsx` (lines 158-164)
- `src/components/Settings.jsx` (lines 158-164)

**Seed data needed:**
- Grand Rapids orgs (existing list)
- Detroit orgs (research needed):
  - Detroit Regional Chamber
  - Detroit Economic Club
  - TechTown Detroit
  - Build Institute
  - Detroit Rotary
  - Inforum (they're statewide)
  - Goldman Sachs 10,000 Small Businesses Detroit
  - etc.

---

### Phase 4: Admin Panel Multi-Region Support

**File:** `src/components/EventSlotsManager.jsx`

**Current state:**
- Hardcoded GR organizations (lines 16-21)
- Hardcoded GR scrape URLs (lines 25-38)
- Events have `full_address` which may contain zip codes
- Some events/ads already have zip codes added

**Approach: Simple region dropdown (can enhance later)**

**4.1 Add region_id to events table**
```sql
ALTER TABLE public.events ADD COLUMN region_id TEXT;
```

**4.2 Region dropdown at top of admin**
```javascript
import { REGIONS } from '../lib/regions.js';

const [selectedRegion, setSelectedRegion] = useState(
  localStorage.getItem('adminRegion') || 'grand-rapids'
);

// Persist selection
const handleRegionChange = (region) => {
  setSelectedRegion(region);
  localStorage.setItem('adminRegion', region);
};

// Filter events by selected region
const loadEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('region_id', selectedRegion)
    .order('slot_number', { ascending: true });
  // ...
};
```

**4.3 Admin UI - Region dropdown**
```jsx
{/* Region Selector */}
<div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
  <label className="font-medium">Managing events for:</label>
  <select
    value={selectedRegion}
    onChange={(e) => handleRegionChange(e.target.value)}
    className="px-4 py-2 border rounded-lg font-medium"
  >
    {Object.entries(REGIONS).map(([id, config]) => (
      <option key={id} value={id}>{config.name}</option>
    ))}
  </select>
</div>
```

**4.4 Save events with selected region**
```javascript
const saveEvent = async (slotNumber) => {
  const eventData = {
    ...events[slotNumber],
    region_id: selectedRegion,  // Tag with admin's selected region
    slot_number: slotNumber
  };
  // ... save to Supabase
};
```

**4.5 Dynamic orgs based on selected region**
```javascript
const organizations = REGIONS[selectedRegion]?.organizations
  ? [...REGIONS[selectedRegion].organizations, 'Other']
  : ['Other'];
```

**4.6 Region-specific scrape URLs**
```javascript
// Add scrapeUrls to REGIONS config in lib/regions.js
const REGIONS = {
  'grand-rapids': {
    // ... existing config
    scrapeUrls: {
      'GR Chamber of Commerce': 'https://www.grandrapids.org/events',
      'Economic Club of Grand Rapids': 'https://economicclubgr.org/events',
      // ... existing GR URLs
    }
  },
  'detroit': {
    // ... existing config
    scrapeUrls: {
      'Detroit Regional Chamber': 'https://www.detroitchamber.com/events/',
      'Detroit Economic Club': 'https://econclub.org/events/',
      'TechTown Detroit': 'https://techtowndetroit.org/events/',
      // ... Detroit URLs (to be added)
    }
  }
};

const organizationEventPages = REGIONS[selectedRegion]?.scrapeUrls || {};
```

**Future enhancement:** Can add zip-based auto-detection later if needed

---

### Phase 5: Events Location Filtering (User-facing)

**4.1 Filter events by user's region**

**Files to modify:**
- `src/components/Events.jsx` - add region filter to query
- `src/components/EventDetail.jsx` - remove hardcoded fallback events

```javascript
// Events.jsx - modify fetch
const { data: events } = await supabase
  .from('events')
  .select('*')
  .eq('region_id', userRegion)
  .gte('event_date', today)
  .order('event_date');
```

**4.2 EventSlotsManager - support multi-region**
- Add region selector when creating events
- Default to admin's region

---

### Phase 5: Update Hardcoded Text

**Files with GR references to parameterize:**

| File | Line(s) | Current | Change To |
|------|---------|---------|-----------|
| `EventDetail.jsx` | 525-678 | Hardcoded GR events | Remove fallback, use DB only |
| `OnboardingFlow.jsx` | 158-164 | GR orgs array | Dynamic from DB |
| `Settings.jsx` | 158-164 | GR orgs array | Dynamic from DB |
| `EventSlotsManager.jsx` | placeholder | "Grand Rapids, MI 49503" | Dynamic placeholder |
| `Dashboard.jsx` | ~700 | "Grand Rapids, Michigan" | `user.region.display_name` |

---

## Implementation Order

### Sprint 1: Database Foundation
1. Create `regions` table with GR + Detroit
2. Create `organizations` table
3. Migrate hardcoded GR orgs to table
4. Add `region` column to users table
5. Backfill existing users with 'grand-rapids'

### Sprint 2: Onboarding Updates
1. Add zip-to-region detection utility
2. Add region selection/confirmation step to onboarding
3. Replace hardcoded orgs with dynamic query
4. Save region to user profile

### Sprint 3: Settings & Display
1. Update Settings.jsx with dynamic orgs
2. Add region display to Dashboard
3. Allow region change in Settings (with org reset warning)

### Sprint 4: Events Regionalization
1. Add region_id to events table
2. Backfill existing events with 'grand-rapids'
3. Filter events by user region
4. Update EventSlotsManager for multi-region

### Sprint 5: Detroit Launch Prep
1. Research & add Detroit organizations
2. Source Detroit networking events
3. Beta test with Detroit users
4. Launch!

---

## Detroit Organizations to Research

**Chambers & Business:**
- Detroit Regional Chamber
- Detroit Economic Club
- Michigan Hispanic Chamber of Commerce
- National Association of Black Accountants - Detroit

**Tech & Startup:**
- TechTown Detroit
- Bamboo Detroit (sister to Bamboo GR?)
- Build Institute
- Detroit Startup Week orgs

**Professional:**
- Inforum (statewide - already have)
- Detroit Rotary Clubs
- Young Professionals in Energy - Detroit
- CREW Detroit (if exists)

**Industry Specific:**
- Automation Alley
- Detroit Mobility Lab
- MICHauto

---

## Migration Script Outline

```sql
-- 1. Create regions
INSERT INTO regions (id, name, display_name, state, zip_prefixes, is_active) VALUES
('grand-rapids', 'Grand Rapids', 'Grand Rapids, MI', 'MI', ARRAY['493','494','495'], true),
('detroit', 'Detroit', 'Detroit Metro', 'MI', ARRAY['480','481','482','483','484'], false);

-- 2. Migrate existing orgs
INSERT INTO organizations (name, region_id, category) VALUES
('GR Chamber of Commerce', 'grand-rapids', 'chamber'),
('Rotary Club', 'grand-rapids', 'professional'),
-- ... rest of GR orgs

-- 3. Backfill users
UPDATE users SET region = 'grand-rapids' WHERE region IS NULL;

-- 4. Backfill events
UPDATE events SET region_id = 'grand-rapids' WHERE region_id IS NULL;
```

---

## Questions to Decide

1. **Can users see/connect with people in other regions?**
   - Option A: No, strictly regional (simpler)
   - Option B: Yes, but matching prioritizes same region (more complex)

2. **Can users change their region after signup?**
   - If yes, what happens to their organization selections?

3. **Should Events show "nearby" events from adjacent regions?**

4. **Who manages Detroit events/orgs initially?**
   - Same admin as GR?
   - Need Detroit-based admin?

---

## Files Summary

**Must Modify:**
- `supabase-setup.sql` - add tables
- `src/components/OnboardingFlow.jsx` - region step, dynamic orgs
- `src/components/Settings.jsx` - dynamic orgs, region display
- `src/components/Events.jsx` - region filter
- `src/components/EventDetail.jsx` - remove hardcoded events
- `src/contexts/AuthContext.jsx` - save region on signup

**May Modify:**
- `src/components/Dashboard.jsx` - show region
- `src/components/EventSlotsManager.jsx` - multi-region support
- `src/lib/matchingAlgorithm.js` - only if adding region-based matching weight
