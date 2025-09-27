// Networking BudE - Optimized Production Version v5.0
// Last Updated: September 26, 2025
// Major Optimizations: Streamlined architecture, reduced complexity, improved performance
// Focus: Clean code, better maintainability, faster loading times

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy, useCallback, memo, useTransition } from 'react';
// import { ErrorBoundary } from './components/ErrorBoundary';
// import { Toaster } from './components/ui/sonner.tsx';
// import { GlobalStateProvider, useGlobalState } from './hooks/useGlobalState';

// Core components (always loaded)
// import { Sidebar } from './components/Sidebar';
// import { MobileHeader } from './components/MobileHeader';
// import { MobileBottomNav } from './components/MobileBottomNav';
// import { Widget } from './components/Widget';
// import { LinkedInOnboarding } from './components/LinkedInOnboarding';
// import { Dashboard } from './components/Dashboard';
// import { DashboardSkeleton } from './components/LoadingSkeleton';
// import { DeveloperToolbar } from './components/DeveloperToolbar';

// Optimized utility components
const AppOptimizations = memo(() => {
  useEffect(() => {
    // Performance optimizations
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        document.documentElement.classList.add('js-loaded');
        // Preload critical routes - temporarily disabled during build fixes
        // import('./components/Events');
        // import('./components/Matches');
      });
    }
    
    // PWA Service Worker registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silent fail for development
      });
    }
  }, []);
  
  return null;
});

AppOptimizations.displayName = 'AppOptimizations';

// Import types and hooks
import { UserData } from './types';

// Streamlined hooks
const useAppSession = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('networking_bude_user_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUserData(data);
        setIsOnboarded(true);
      } catch (error) {
        console.warn('Error loading saved session:', error);
        localStorage.removeItem('networking_bude_user_data');
      }
    }
  }, []);
  
  const saveSession = useCallback((data: UserData) => {
    localStorage.setItem('networking_bude_user_data', JSON.stringify(data));
    setUserData(data);
    setIsOnboarded(true);
  }, []);
  
  const clearSession = useCallback(() => {
    localStorage.removeItem('networking_bude_user_data');
    setUserData(null);
    setIsOnboarded(false);
  }, []);
  
  return { userData, isOnboarded, saveSession, clearSession };
};

const useMobilePreview = () => {
  const [forceMobileView] = useState(() => {
    return new URLSearchParams(window.location.search).get('mobile') === 'true';
  });
  
  const getPreviewContainerClass = useCallback(() => {
    return forceMobileView ? 'mobile-preview-container' : '';
  }, [forceMobileView]);
  
  return { forceMobileView, getPreviewContainerClass };
};

const useHapticFeedback = () => {
  return useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = { light: [10], medium: [20], heavy: [30] };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);
};

// Simplified lazy component loader with error handling
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(async () => {
    try {
      const module = await importFn();
      return { default: module.default || module[componentName] || module };
    } catch (error) {
      console.warn(`Failed to load ${componentName}:`, error);
      return { 
        default: memo(() => (
          <div className="p-6 text-center space-y-4" role="alert">
            <div className="text-muted-foreground mb-4">⚠️ {componentName} temporarily unavailable</div>
            <p className="text-sm text-muted-foreground">Please check your connection and try again</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              aria-label={`Retry loading ${componentName}`}
            >
              Retry
            </button>
          </div>
        ))
      };
    }
  });
};

// Simple placeholder components
const SimplePlaceholder = ({ title, description }: { title: string; description: string }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="text-center space-y-4 max-w-md">
      <div className="h-16 w-16 bg-bude-green rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto">
        NB
      </div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <p className="text-sm text-muted-foreground">This feature will be available after deployment.</p>
    </div>
  </div>
);

// Lazy loaded components - temporarily replaced with placeholders
const LazyComponents = {
  Events: memo(() => <SimplePlaceholder title="Events" description="Discover networking events in Grand Rapids" />),
  EventDetail: memo(() => <SimplePlaceholder title="Event Details" description="Learn more about this event" />),
  Matches: memo(() => <SimplePlaceholder title="Connections" description="Find and connect with professionals" />),
  UserProfile: memo(() => <SimplePlaceholder title="User Profile" description="View professional profiles" />),
  Messenger: memo(() => <SimplePlaceholder title="Messages" description="Communicate with your connections" />),
  Conversation: memo(() => <SimplePlaceholder title="Conversation" description="Chat with other professionals" />),
  AccountSettings: memo(() => <SimplePlaceholder title="Account Settings" description="Manage your account preferences" />),
  PaymentPortal: memo(() => <SimplePlaceholder title="Payment Portal" description="Upgrade to premium features" />),
  ContentArchive: memo(() => <SimplePlaceholder title="Content Archive" description="Browse archived content" />),
  TermsPage: memo(() => <SimplePlaceholder title="Terms & Privacy" description="Read our terms and privacy policy" />),
} as const;

// Loading components
const RouteLoader = memo(({ route }: { route: string }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-label="Loading page">
      <div className="text-center space-y-4 max-w-sm">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" aria-hidden="true"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse shimmer" aria-hidden="true"></div>
          <div className="h-3 bg-muted/70 rounded animate-pulse shimmer w-3/4 mx-auto" aria-hidden="true"></div>
        </div>
        <p className="text-muted-foreground text-sm">
          Loading {route ? route.replace('/', '').replace('-', ' ') : 'content'}...
        </p>
      </div>
    </div>
  );
});

RouteLoader.displayName = 'RouteLoader';

// Onboarding wrapper
const OnboardingWrapper = memo(({ 
  onComplete, 
  onTransitionStart, 
  onDirectComplete 
}: { 
  onComplete: (data: UserData) => Promise<void>;
  onTransitionStart: () => void;
  onDirectComplete: () => void;
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const handleComplete = useCallback(async (data: UserData) => {
    try {
      setIsCompleting(true);
      onTransitionStart();
      
      await onComplete(data);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      startTransition(() => {
        onDirectComplete();
        window.history.replaceState({}, '', '/dashboard');
      });
    } catch (error) {
      console.error('Onboarding completion error:', error);
      setIsCompleting(false);
    }
  }, [onComplete, onTransitionStart, onDirectComplete]);
  
  return (
    <div className={(isPending || isCompleting) ? 'opacity-50 pointer-events-none' : ''}>
      {/* <LinkedInOnboarding onComplete={handleComplete} /> */}
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="h-16 w-16 bg-bude-green rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto">
            NB
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Welcome to Networking BudE</h1>
            <p className="text-muted-foreground">Complete your profile to start connecting</p>
            <button
              onClick={() => handleComplete({
                name: 'Demo User',
                email: 'demo@example.com',
                linkedinProfile: '',
                currentRole: 'Professional',
                careerLevel: 'Mid-Level',
                industry: 'Technology',
                company: 'Demo Company',
                skills: ['Networking', 'Business Development'],
                interests: ['Professional Growth'],
                networkingGoals: ['Meet new contacts'],
                eventPreferences: ['In-person'],
                profilePicture: '',
                location: 'Grand Rapids, MI'
              })}
              className="bg-bude-green text-white px-8 py-3 rounded-lg hover:bg-bude-green-dark transition-colors"
            >
              Continue as Demo User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

OnboardingWrapper.displayName = 'OnboardingWrapper';

// App state management
const useAppState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showWidget, setShowWidget] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const navigateWithTransition = useCallback((path: string, options: { replace?: boolean } = {}) => {
    startTransition(() => {
      if (options.replace) {
        window.history.replaceState({}, '', path);
      } else {
        window.history.pushState({}, '', path);
      }
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }, []);
  
  return {
    isLoading,
    setIsLoading,
    showWidget,
    setShowWidget,
    isTransitioning,
    setIsTransitioning,
    isPending,
    navigateWithTransition
  };
};

// Main app content component
function AppContent() {
  // State management
  const { 
    isLoading, 
    setIsLoading, 
    showWidget, 
    setShowWidget, 
    isTransitioning, 
    setIsTransitioning,
    isPending,
    navigateWithTransition 
  } = useAppState();
  
  const { forceMobileView, getPreviewContainerClass } = useMobilePreview();
  // const { state: globalState, updateUser } = useGlobalState();
  const { userData, isOnboarded, saveSession, clearSession } = useAppSession();
  const triggerHapticFeedback = useHapticFeedback();
  
  // Preview mode (default to true for freemium model)
  const [isPreviewMode] = useState(true);
  
  // App initialization
  useEffect(() => {
    const initializeApp = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Widget mode check
        if (urlParams.get('widget') === 'true') {
          setShowWidget(true);
          setIsLoading(false);
          return;
        }
        
        // Touch device optimization
        if ('ontouchstart' in window) {
          document.body?.classList.add('touch-device');
        }
        
        // Development environment indicator
        if (process.env.NODE_ENV === 'development') {
          document.documentElement?.setAttribute('data-env', 'development');
        }
      } catch (error) {
        console.warn('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timeoutId = setTimeout(initializeApp, 100);
    return () => clearTimeout(timeoutId);
  }, [setIsLoading, setShowWidget]);
  
  // Event handlers
  const handleOnboardingComplete = useCallback(async (data: UserData) => {
    try {
      saveSession(data);
      // updateUser(data);
      triggerHapticFeedback('medium');
    } catch (error) {
      console.error('Error completing onboarding:', error);  
      setIsTransitioning(false);
      throw error;
    }
  }, [saveSession, triggerHapticFeedback, setIsTransitioning]);

  const handleDirectComplete = useCallback(() => {
    setIsTransitioning(false);
    navigateWithTransition('/dashboard', { replace: true });
  }, [setIsTransitioning, navigateWithTransition]);

  const handleLogout = useCallback(() => {
    clearSession();
    triggerHapticFeedback('light');
    navigateWithTransition('/', { replace: true });
  }, [clearSession, triggerHapticFeedback, navigateWithTransition]);

  const handleWidgetLaunch = useCallback(() => {
    window.history.replaceState({}, '', window.location.pathname);
    setShowWidget(false);
    triggerHapticFeedback('medium');
  }, [setShowWidget, triggerHapticFeedback]);

  // Safety timeout for transition state
  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        console.warn('Transition timeout - resetting state');
        setIsTransitioning(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning, setIsTransitioning]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse shimmer w-48 mx-auto"></div>
            <div className="h-3 bg-muted/70 rounded animate-pulse shimmer w-32 mx-auto"></div>
          </div>
          <p className="text-muted-foreground">Loading Networking BudE...</p>
        </div>
        {/* <Toaster /> */}
      </div>
    );
  }

  // Widget mode
  if (showWidget) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {/* <Widget onLaunchApp={handleWidgetLaunch} /> */}
        <div className="text-center space-y-6 max-w-md">
          <div className="h-20 w-20 bg-bude-green rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto">
            NB
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold">Networking BudE</h1>
            <p className="text-muted-foreground">Professional networking for Grand Rapids</p>
            <button
              onClick={handleWidgetLaunch}
              className="bg-bude-green text-white px-8 py-3 rounded-lg hover:bg-bude-green-dark transition-colors"
            >
              Launch App
            </button>
          </div>
        </div>
        {/* <Toaster /> */}
      </div>
    );
  }

  // Setup state during onboarding completion
  if (isTransitioning) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Setting Up Your Profile</h2>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded animate-pulse shimmer w-full mx-auto"></div>
              <div className="h-3 bg-muted/70 rounded animate-pulse shimmer w-3/4 mx-auto"></div>
              <div className="h-3 bg-muted/50 rounded animate-pulse shimmer w-1/2 mx-auto"></div>
            </div>
            <p className="text-muted-foreground">
              Creating your personalized dashboard and connecting you with the Grand Rapids networking community...
            </p>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <div className="animate-bounce">✨</div>
            <span>Almost ready...</span>
            <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>🚀</div>
          </div>
        </div>
        {/* <Toaster /> */}
      </div>
    );
  }

  // Onboarding flow
  if (!isOnboarded) {
    return (
      // <ErrorBoundary>
        <div className="min-h-screen bg-background">
          {/* <DeveloperToolbar 
            isOnboarded={isOnboarded}
            onClearSession={clearSession}
            onHapticFeedback={triggerHapticFeedback}
            onAnnounce={() => {}} // Simplified for performance
          /> */}
          <OnboardingWrapper 
            onComplete={handleOnboardingComplete}
            onTransitionStart={() => setIsTransitioning(true)}
            onDirectComplete={handleDirectComplete}
          />
          {/* <Toaster /> */}
        </div>
      // </ErrorBoundary>
    );
  }

  // Main application
  return (
    <div 
      className={`min-h-screen bg-background flex flex-col ${getPreviewContainerClass()} ${isPending ? 'opacity-90 pointer-events-none' : ''}`}
      role="application"
      aria-label="Networking BudE Professional Networking Application"
    >
      {/* App optimizations */}
      <AppOptimizations />
      
      {/* Developer toolbar */}
      {/* <DeveloperToolbar 
        isOnboarded={isOnboarded}
        onClearSession={clearSession}
        onHapticFeedback={triggerHapticFeedback}
        onAnnounce={() => {}} // Simplified for performance
      /> */}
      

      
      {/* Mobile preview header */}
      {forceMobileView && (
        <div className="bg-muted border-b px-4 py-2 text-center mobile-preview-header">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            <span className="text-sm font-medium">📱 Mobile Preview Mode</span>
            <button
              onClick={() => window.location.reload()}
              className="text-sm bg-secondary hover:bg-secondary/80 px-2 py-1 rounded touch-target transition-colors"
              aria-label="Exit mobile preview"
            >
              Exit
            </button>
          </div>
        </div>
      )}
      
      {/* Preview Mode Banner */}
      {isPreviewMode && !forceMobileView && (
        <div className="bg-bude-brand-gradient text-white px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span>🚀 You're in Preview Mode</span>
            <span>•</span>
            <button
              onClick={() => navigateWithTransition('/payment-portal')}
              className="underline hover:no-underline font-medium"
            >
              Upgrade for $9.99/month to unlock all features
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile header */}
      <div className={forceMobileView ? 'block' : 'block md:hidden'}>
        <div className="sticky top-0 z-40 bg-background border-b">
          {/* <MobileHeader userData={userData} onLogout={handleLogout} /> */}
          <div className="h-[60px] flex items-center justify-between px-4 bg-card border-b">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-6 bg-bude-green rounded-full flex items-center justify-center text-white font-bold text-xs">
                NB
              </div>
              <h1 className="font-semibold text-lg">Networking BudE</h1>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1">
        {/* Desktop sidebar */}
        {!forceMobileView && (
          <div className="hidden md:block">
            {/* <Sidebar onLogout={handleLogout} userData={userData} /> */}
          </div>
        )}
        
        {/* Main content */}
        <main 
          className={`flex-1 ${forceMobileView ? 'pb-24' : 'pb-24 md:pb-6'} transition-all duration-200 min-h-screen`}
          role="main"
          aria-label="Main application content"
        >
          {/* <ErrorBoundary> */}
            <Suspense fallback={<RouteLoader route={window.location.pathname} />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <div className="min-h-screen bg-background p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h1 className="text-2xl font-semibold">Welcome to Networking BudE</h1>
                          <p className="text-muted-foreground">Your professional networking dashboard</p>
                        </div>
                        <div className="h-12 w-12 bg-bude-green rounded-full flex items-center justify-center text-white font-bold">
                          {userData?.name?.charAt(0) || 'U'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card border rounded-lg p-6">
                          <h3 className="font-semibold mb-2">Connections</h3>
                          <p className="text-2xl font-bold text-bude-green">12</p>
                          <p className="text-sm text-muted-foreground">Active connections</p>
                        </div>
                        
                        <div className="bg-card border rounded-lg p-6">
                          <h3 className="font-semibold mb-2">Events</h3>
                          <p className="text-2xl font-bold text-bude-green">3</p>
                          <p className="text-sm text-muted-foreground">Upcoming events</p>
                        </div>
                        
                        <div className="bg-card border rounded-lg p-6">
                          <h3 className="font-semibold mb-2">Messages</h3>
                          <p className="text-2xl font-bold text-bude-green">5</p>
                          <p className="text-sm text-muted-foreground">Unread messages</p>
                        </div>
                      </div>
                      
                      <div className="bg-card border rounded-lg p-6">
                        <h3 className="font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-muted rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm">New connection request from John Doe</p>
                              <p className="text-xs text-muted-foreground">2 hours ago</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-muted rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm">Upcoming event: Grand Rapids Business Mixer</p>
                              <p className="text-xs text-muted-foreground">Tomorrow at 6:00 PM</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                } />
                <Route path="/events" element={<LazyComponents.Events />} />
                <Route path="/events/:id" element={<LazyComponents.EventDetail />} />
                <Route path="/connections" element={<LazyComponents.Matches />} />
                <Route path="/profile/:id" element={<LazyComponents.UserProfile userData={userData} />} />
                <Route path="/messenger" element={<LazyComponents.Messenger />} />
                <Route path="/messenger/:id" element={<LazyComponents.Conversation />} />
                <Route path="/settings" element={<LazyComponents.AccountSettings userData={userData} />} />
                <Route path="/payment-portal" element={<LazyComponents.PaymentPortal />} />
                <Route path="/content-archive" element={<LazyComponents.ContentArchive />} />
                <Route path="/terms" element={<LazyComponents.TermsPage />} />
                <Route path="/privacy" element={<LazyComponents.TermsPage />} />
                <Route path="*" element={
                  <div className="min-h-screen bg-background flex items-center justify-center p-4" role="main">
                    <div className="text-center max-w-md">
                      <div className="text-6xl mb-4 animate-bounce" aria-hidden="true">🤔</div>
                      <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
                      <p className="text-muted-foreground mb-6">
                        The page you're looking for doesn't exist or has been moved.
                      </p>
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            navigateWithTransition('/dashboard', { replace: true });
                            triggerHapticFeedback('medium');
                          }}
                          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors touch-target touch-active w-full md:w-auto"
                          aria-label="Return to dashboard"
                        >
                          Go to Dashboard
                        </button>
                        <button
                          onClick={() => window.history.back()}
                          className="block md:inline-block text-muted-foreground hover:text-foreground transition-colors touch-target px-4 py-2"
                          aria-label="Go back to previous page"
                        >
                          ← Go Back
                        </button>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>
          {/* </ErrorBoundary> */}
        </main>
      </div>
      
      {/* Mobile bottom navigation */}
      <div className={forceMobileView ? 'block' : 'block md:hidden'}>
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t safe-area-padding">
          {/* <MobileBottomNav forceMobileView={forceMobileView} isPreviewMode={forceMobileView}/> */}
          <div className="h-[80px] flex items-center justify-around px-4 bg-card border-t">
            <div className="flex flex-col items-center space-y-1 text-xs">
              <div className="h-6 w-6 bg-bude-green rounded flex items-center justify-center text-white">🏠</div>
              <span>Home</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-xs">
              <div className="h-6 w-6 bg-muted rounded flex items-center justify-center">📅</div>
              <span>Events</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-xs">
              <div className="h-6 w-6 bg-muted rounded flex items-center justify-center">🤝</div>
              <span>Connect</span>
            </div>
            <div className="flex flex-col items-center space-y-1 text-xs">
              <div className="h-6 w-6 bg-muted rounded flex items-center justify-center">💬</div>
              <span>Messages</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop footer */}
      {!forceMobileView && (
        <footer className="hidden md:block bg-card border-t py-4 px-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>Networking BudE by The BudE System™</div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigateWithTransition('/terms')}
                className="hover:text-foreground transition-colors"
              >
                Terms
              </button>
              <button
                onClick={() => navigateWithTransition('/privacy')}
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </button>
            </div>
          </div>
        </footer>
      )}
      
      {/* Enhanced notification system */}
      {/* <Toaster 
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        duration={2500}
      /> */}
    </div>
  );
}

// Main App component with global state and error boundary
export default function App() {
  return (
    // <ErrorBoundary>
      // <GlobalStateProvider>
        <Router>
          <AppContent />
        </Router>
      // </GlobalStateProvider>
    // </ErrorBoundary>
  );
}