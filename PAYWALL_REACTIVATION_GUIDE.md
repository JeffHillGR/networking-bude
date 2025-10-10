# Paywall Reactivation Guide

## Overview
This guide shows you how to re-enable the paywall/upgrade prompts that were removed for beta testing. All features are currently accessible to all users during beta. Use this guide when you're ready to implement the premium/freemium model.

## What Was Removed (October 10, 2025)

### 1. Top Gradient Bar Changes
**What it was:**
- Toggle between "Dev Mode" and "Preview Mode"
- "Upgrade $9.99/month to unlock features" message
- "Enter Dev Mode" / "Switch to Preview" button

**What it became:**
- "Beta Testing - All Features Unlocked" message
- "Reset to Onboarding" button (kept for testing)

**File:** `src/components/Dashboard.jsx` (lines ~421-435)

### 2. Feature Gates Removed

#### Events
- **View All Events button** - Previously showed upgrade popup, now directly opens Events tab
- **Event Details button** - Previously showed upgrade popup, now directly opens event detail page

#### Connections
- **View All Connections button** - Previously showed upgrade popup, now directly opens Connections tab
- **Connections Tab** - Previously showed "Premium Feature" screen, now shows full Connections component

#### Messages
- **Messages Tab** - Previously showed "Premium Feature" screen, now shows full Messages component

### 3. State Management Removed
- `isDevMode` state variable
- `showUpgradePopup` state variable
- `showUpgradeModal` state variable
- `shouldShowUpgradePrompt()` function

---

## How to Re-enable Paywalls

### Step 1: Restore State Variables

In `src/components/Dashboard.jsx`, around line 19, add back:

```javascript
const [showUpgradePopup, setShowUpgradePopup] = useState(false);
const [isDevMode, setIsDevMode] = useState(false);
const [showUpgradeModal, setShowUpgradeModal] = useState(false);
```

### Step 2: Restore shouldShowUpgradePrompt Function

Around line 36 (after `getGreeting()` function):

```javascript
const shouldShowUpgradePrompt = (feature) => {
  if (isDevMode) return false; // Dev mode bypasses all gates
  return true; // Preview mode shows upgrade prompts
};
```

**Note:** You'll likely want to update this logic to check:
- User's subscription status from database
- Which plan they're on (Free vs Pro vs Plus)
- Feature entitlements

**Example with real backend:**
```javascript
const shouldShowUpgradePrompt = (feature) => {
  if (isDevMode) return false;

  const userPlan = localStorage.getItem('userPlan') || 'free';

  // Define feature access by plan
  const featureAccess = {
    free: ['dashboard', 'profile', 'settings'],
    pro: ['dashboard', 'profile', 'settings', 'events'],
    plus: ['dashboard', 'profile', 'settings', 'events', 'connections', 'messages', 'eventDetails']
  };

  return !featureAccess[userPlan].includes(feature);
};
```

### Step 3: Restore Top Gradient Bar

Around line 421, replace:

```javascript
// CURRENT (Beta version)
<div className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-400 text-white px-4 py-2 text-center text-sm md:text-base">
  <span className="font-medium">
    Beta Testing - All Features Unlocked
  </span>
  <span className="mx-2">•</span>
  <button
    onClick={() => {
      localStorage.removeItem('onboardingCompleted');
      window.location.href = '/';
    }}
    className="underline hover:no-underline font-medium"
  >
    Reset to Onboarding
  </button>
</div>
```

With:

```javascript
// PRODUCTION (Paywall version)
<div className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-400 text-white px-4 py-2 text-center text-sm md:text-base">
  <span className="font-medium">
    {isDevMode ? '🔧 Dev Mode' : '🎨 Preview Mode'}
  </span>
  <span className="mx-2">•</span>
  <span>Upgrade $9.99/month to unlock features</span>
  <span className="mx-2">•</span>
  <button
    onClick={() => setIsDevMode(!isDevMode)}
    className="underline hover:no-underline font-medium"
  >
    {isDevMode ? 'Switch to Preview' : 'Enter Dev Mode'}
  </button>
  {isDevMode && (
    <>
      <span className="mx-2">•</span>
      <button
        onClick={() => {
          localStorage.removeItem('onboardingCompleted');
          window.location.href = '/';
        }}
        className="underline hover:no-underline font-medium"
      >
        Reset to Onboarding
      </button>
    </>
  )}
</div>
```

### Step 4: Restore View All Events Button Gate

Around line 253, replace:

```javascript
// CURRENT (Beta version)
<button
  onClick={() => setActiveTab('events')}
  className="text-sm text-green-600 font-medium hover:underline"
>
  View All Events
</button>
```

With:

```javascript
// PRODUCTION (Paywall version)
<button
  onClick={() => {
    if (shouldShowUpgradePrompt('events')) {
      setShowUpgradePopup(true);
    } else {
      setActiveTab('events');
    }
  }}
  className="text-sm text-green-600 font-medium hover:underline"
>
  View All Events
</button>
```

### Step 5: Restore View All Connections Button Gate

Around line 212, replace:

```javascript
// CURRENT (Beta version)
<button
  onClick={() => setActiveTab('connections')}
  className="text-sm text-green-600 font-medium hover:underline"
>
  View All
</button>
```

With:

```javascript
// PRODUCTION (Paywall version)
<button
  onClick={() => {
    if (shouldShowUpgradePrompt('connections')) {
      setShowUpgradePopup(true);
    } else {
      setActiveTab('connections');
    }
  }}
  className="text-sm text-green-600 font-medium hover:underline"
>
  View All
</button>
```

### Step 6: Restore Event Details Button Gate

Around line 283, replace:

```javascript
// CURRENT (Beta version)
<button
  onClick={() => navigate(`/events/${event.id}`)}
  className="text-[#009900] font-medium hover:text-[#007700] flex items-center gap-1 text-xs"
>
  View Details
  <ExternalLink className="h-3 w-3" />
</button>
```

With:

```javascript
// PRODUCTION (Paywall version)
<button
  onClick={() => {
    if (shouldShowUpgradePrompt('eventDetails')) {
      setShowUpgradePopup(true);
    } else {
      navigate(`/events/${event.id}`);
    }
  }}
  className="text-[#009900] font-medium hover:text-[#007700] flex items-center gap-1 text-xs"
>
  View Details
  <ExternalLink className="h-3 w-3" />
</button>
```

### Step 7: Restore Connections Tab Gate

Around line 330, replace:

```javascript
// CURRENT (Beta version)
case 'connections':
  return <Connections />;
```

With:

```javascript
// PRODUCTION (Paywall version)
case 'connections':
  if (shouldShowUpgradePrompt('connections')) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6">Upgrade to BudE+ to access Connections</p>
          <button
            onClick={() => setActiveTab('subscription')}
            className="bg-[#009900] text-white px-6 py-3 rounded-lg border-[3px] border-[#D0ED00] hover:bg-green-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }
  return <Connections />;
```

### Step 8: Restore Messages Tab Gate

Around line 333, replace:

```javascript
// CURRENT (Beta version)
case 'messages':
  return <Messages />;
```

With:

```javascript
// PRODUCTION (Paywall version)
case 'messages':
  if (shouldShowUpgradePrompt('messages')) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6">Upgrade to BudE+ to access Messages</p>
          <button
            onClick={() => setActiveTab('subscription')}
            className="bg-[#009900] text-white px-6 py-3 rounded-lg border-[#D0ED00] hover:bg-green-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }
  return <Messages />;
```

---

## Testing Paywall Reactivation

After restoring paywalls, test both modes:

### Dev Mode (All Features Accessible)
1. Load dashboard
2. Click "Enter Dev Mode" in top bar
3. Try accessing:
   - View All Events
   - View All Connections
   - Event Details
   - Connections tab
   - Messages tab
4. All should work without upgrade prompts

### Preview Mode (Paywalls Active)
1. Click "Switch to Preview" in top bar
2. Try accessing same features
3. Should see upgrade prompts/screens
4. Click "Upgrade Now" buttons
5. Should navigate to Subscription page

---

## Customizing for Your Pricing Model

When you have your backend and pricing tiers defined:

### 1. Define Your Plans

```javascript
const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    features: ['dashboard', 'profile', 'settings']
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: '$9.99/month',
    features: ['dashboard', 'profile', 'settings', 'events', 'eventDetails']
  },
  PLUS: {
    id: 'plus',
    name: 'Plus',
    price: '$19.99/month',
    features: ['dashboard', 'profile', 'settings', 'events', 'eventDetails', 'connections', 'messages']
  }
};
```

### 2. Update shouldShowUpgradePrompt

```javascript
const shouldShowUpgradePrompt = (feature) => {
  if (isDevMode) return false;

  // Get user's plan from your backend/auth
  const userPlan = user?.subscriptionPlan || 'free';

  // Check if user's plan includes this feature
  const plan = Object.values(PLANS).find(p => p.id === userPlan);
  return !plan?.features.includes(feature);
};
```

### 3. Customize Upgrade Messages

Update the upgrade screens to show:
- Which plan unlocks the feature
- Specific benefits of upgrading
- Comparison of plans
- Direct link to the right subscription tier

Example:

```javascript
case 'connections':
  if (shouldShowUpgradePrompt('connections')) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Unlock Connections with BudE+
          </h2>
          <p className="text-gray-600 mb-6">
            Connect with professionals who match your interests, industry, and goals.
            BudE+ gives you unlimited access to:
          </p>
          <ul className="text-left text-gray-700 mb-6 space-y-2">
            <li>✅ View all potential connections</li>
            <li>✅ See compatibility scores</li>
            <li>✅ Send connection requests</li>
            <li>✅ Direct messaging</li>
          </ul>
          <button
            onClick={() => {
              setActiveTab('subscription');
              // Optionally pre-select the Plus plan
            }}
            className="bg-[#009900] text-white px-6 py-3 rounded-lg border-[3px] border-[#D0ED00] hover:bg-green-700"
          >
            Upgrade to BudE+ - $19.99/month
          </button>
        </div>
      </div>
    );
  }
  return <Connections />;
```

---

## Backend Integration Checklist

When connecting to your backend:

- [ ] Replace `isDevMode` check with actual user subscription status
- [ ] Fetch user's plan from database on dashboard load
- [ ] Update `shouldShowUpgradePrompt` to check against user's plan
- [ ] Add plan comparison logic
- [ ] Handle plan upgrades/downgrades
- [ ] Add loading states while checking subscription status
- [ ] Handle expired subscriptions
- [ ] Add grace period logic if needed
- [ ] Track which features users attempt to access (analytics)
- [ ] A/B test different upgrade messaging

---

## Git History Reference

To see exactly what was changed:

```bash
# See the commit that removed paywalls
git log --oneline --grep="paywall"

# See the diff of paywall removal
git show <commit-hash>

# Revert the paywall removal (brings paywalls back)
git revert <commit-hash>
```

---

## Quick Reactivation Commands

If you just want to bring everything back quickly:

```bash
# Option 1: Revert the commit that removed paywalls
git revert <paywall-removal-commit-hash>

# Option 2: Manual reactivation (follow steps 1-8 above)
```

---

## Notes

- **Don't forget to update the pricing on the Subscription page** if you change the amounts
- **Test both authenticated and unauthenticated states** when you have auth
- **Consider adding a "Trial" state** for users to try premium features
- **Add analytics** to track which features drive the most upgrades
- **A/B test different upgrade prompts** to optimize conversion

---

## Support

If you need help reactivating paywalls or have questions:
1. Check this guide first
2. Look at git history: `git log --all --grep="paywall"`
3. Compare with the production branch if you kept one
4. Refer to BEST_PRACTICES.md for change impact analysis

---

**Last Updated:** October 10, 2025
**Removed By:** Paywall removal for beta testing
**To Be Restored:** After beta validation, when backend is implemented
