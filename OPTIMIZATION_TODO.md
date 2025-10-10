# Weekend Optimization TODO List

## High Priority - Performance & Code Quality

### 1. **Extract Static Data to Separate Files**
**Current Issue:** Dashboard.jsx and OnboardingFlow.jsx have large arrays hardcoded in components
- [ ] Move `jobTitleSuggestions` (96 items) from OnboardingFlow.jsx to `src/data/jobTitles.js`
- [ ] Move `organizations` array to `src/data/organizations.js`
- [ ] Move `professionalInterestOptions` to `src/data/professionalInterests.js`
- [ ] Move `defaultFeaturedContent` from Dashboard.jsx to `src/data/defaultContent.js`
- [ ] Move `mockEvents` and `connections` to `src/data/mockData.js`

**Benefits:** Cleaner components, easier to maintain, better bundle splitting

### 2. **Create Custom Hooks for Reusable Logic**
- [ ] Extract localStorage logic into `src/hooks/useLocalStorage.js`
  - Currently repeated in Dashboard.jsx (lines 32, 45-52, 95) and OnboardingFlow.jsx
  - Example: `const [userFirstName, setUserFirstName] = useLocalStorage('userFirstName', 'there')`
- [ ] Create `src/hooks/useFeaturedContent.js` to handle admin content loading logic
- [ ] Create `src/hooks/useGreeting.js` for time-based greeting logic

**Benefits:** DRY code, easier testing, better reusability

### 3. **Optimize Bundle Size (Currently 360KB)**
- [ ] Check if all lucide-react icons are tree-shaken (import only what you need)
- [ ] Consider lazy loading heavy components:
  ```javascript
  const Events = lazy(() => import('./Events'));
  const Connections = lazy(() => import('./Connections'));
  ```
- [ ] Add `React.memo()` to components that don't need frequent re-renders:
  - Sidebar.jsx
  - Featured Content card
  - Connection cards

**Benefits:** Faster initial load, better perceived performance

### 4. **Error Handling & Validation**
- [ ] Add try-catch around localStorage operations (can fail in private browsing)
- [ ] Add error boundary component for graceful failure handling
- [ ] Add form validation messages in OnboardingFlow (currently no visual feedback for invalid fields)
- [ ] Add loading states for Google Forms submission (currently just disables button)

**Benefits:** Better user experience, fewer crashes

## Medium Priority - Code Organization

### 5. **Create Utility Functions**
- [ ] Extract repeated localStorage JSON parsing into `src/utils/storage.js`:
  ```javascript
  export const getStorageItem = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  };
  ```
- [ ] Create `src/utils/validation.js` for form validation logic
- [ ] Create `src/utils/formatters.js` for date/time formatting

**Benefits:** Consistent error handling, easier to test

### 6. **Component Refactoring**
- [ ] Dashboard.jsx is 300+ lines - consider breaking into smaller components:
  - `<HeroBanner />` (lines 128-140)
  - `<FeaturedContentCard />` (lines 147-204)
  - `<ConnectionsPreview />` (lines 206-250)
  - `<EventsPreview />` (lines 252+)
- [ ] OnboardingFlow.jsx is 780+ lines - break into step components:
  - `<WelcomeStep />` (renderWelcome)
  - `<BasicInfoStep />` (renderStep1)
  - `<InterestsStep />` (renderStep2)

**Benefits:** Easier to maintain, better testability, clearer structure

### 7. **TypeScript Preparation (Optional but Recommended)**
- [ ] Add JSDoc comments to all functions for better IDE support
- [ ] Document prop types for components
- [ ] Consider migrating to TypeScript incrementally (rename .jsx to .tsx as you refactor)

**Benefits:** Catch bugs earlier, better autocomplete, self-documenting code

## Low Priority - Nice to Haves

### 8. **Accessibility Improvements**
- [ ] Add ARIA labels to icon buttons (navigation arrows, eye icon, etc.)
- [ ] Ensure all images have meaningful alt text
- [ ] Add keyboard navigation support for Featured Content carousel
- [ ] Test with screen reader
- [ ] Add focus indicators that meet WCAG standards

**Benefits:** Better for all users, SEO benefits, legal compliance

### 9. **SEO & Meta Tags**
- [ ] Add proper meta tags in index.html
- [ ] Add Open Graph tags for social sharing
- [ ] Add favicon variations (already have one, but add different sizes)
- [ ] Create sitemap.xml
- [ ] Add robots.txt

**Benefits:** Better discoverability, professional social sharing

### 10. **Development Experience**
- [ ] Add ESLint configuration for code consistency
- [ ] Add Prettier for automatic formatting
- [ ] Set up pre-commit hooks with husky
- [ ] Add environment variables for API endpoints (prepare for backend)
- [ ] Create `.env.example` file

**Benefits:** Consistent code style, fewer bugs, easier onboarding for collaborators

## Specific Code Smells to Address

### Dashboard.jsx Issues:
- **Line 122:** Remove `console.log('Current activeTab:', activeTab);` (production code)
- **Lines 45-52:** Repetitive localStorage parsing - use a utility function
- **Line 3:** Importing `SettingsIcon` renamed from lucide-react - inconsistent naming
- **Lines 88-92:** Mock connections data should be in separate file for easy updates

### OnboardingFlow.jsx Issues:
- **Lines 41-96:** All static data should be extracted
- **No email validation** - users can enter invalid emails
- **No password strength validation** - just shows requirements, doesn't enforce
- **Line 150:** Google Forms error is swallowed - user never knows if submission failed

### GoogleForms.js Issues:
- **No retry logic** - if submission fails, it's just lost
- **No queue system** - if user is offline, data is lost
- **Consider using** IndexedDB to store submissions offline, sync when online

## Performance Metrics to Track

Before optimizations:
- Bundle size: 360KB (94.75KB gzipped)
- Build time: 17 seconds
- Initial load: [measure this]
- Time to interactive: [measure this]

After optimizations, aim for:
- Bundle size: <300KB (reduces load time)
- Build time: <15 seconds
- Initial load: <2 seconds on 3G
- Time to interactive: <3 seconds

## Testing Checklist
- [ ] Test all optimizations on local dev server
- [ ] Run production build and test
- [ ] Test on mobile devices
- [ ] Test with slow 3G throttling
- [ ] Check that Google Forms still submits correctly
- [ ] Verify all localStorage operations work
- [ ] Test in incognito/private browsing mode

## Resources for Learning
- React.memo: https://react.dev/reference/react/memo
- Code splitting: https://react.dev/reference/react/lazy
- Custom hooks: https://react.dev/learn/reusing-logic-with-custom-hooks
- Bundle analysis: `npm run build -- --mode production` then analyze with tools

## Notes
- Don't optimize prematurely - measure first!
- Keep commits small and focused
- Test each optimization individually
- Document why you made each change
- Consider creating a separate branch for experimental optimizations

---

**Estimated Time Investment:**
- High Priority (1-3): 4-6 hours
- Medium Priority (4-7): 3-4 hours
- Low Priority (8-10): 2-3 hours

**Quick Wins to Start With:**
1. Extract static data (30 minutes, immediate cleanup)
2. Remove console.log (5 minutes)
3. Add error boundaries (1 hour, immediate UX improvement)
4. Create useLocalStorage hook (30 minutes, reduces repetition)
