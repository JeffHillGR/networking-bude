// Networking BudE - Production Version v13.3 - Vercel Build Fix
// Static Imports with Error Boundaries - Component Resolution Fixed

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Suspense, useCallback, memo } from 'react';
import { UserData } from './types';

// Core components - static imports
import { LinkedInOnboarding } from './components/LinkedInOnboarding';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileHeader } from './components/MobileHeader';

// Rich components - static imports with error handling
import { Dashboard } from './components/Dashboard';
import { Events } from './components/Events';
import { EventDetail } from './components/EventDetail';
import { Matches } from './components/Matches';
import { UserProfile } from './components/UserProfile';
import { Messenger } from './components/Messenger';
import { Conversation } from './components/Conversation';
import { AccountSettings } from './components/AccountSettings';
import { PaymentPortal } from './components/PaymentPortal';
import { ContentArchive } from './components/ContentArchive';
import { TermsPage } from './components/TermsPage';

// Loading component with BudE branding
const RouteLoader = memo(() => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto">
        NB
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
      <p className="text-muted-foreground">Loading Networking BudE...</p>
    </div>
  </div>
));

RouteLoader.displayName = 'RouteLoader';

// Fallback component for failed components
const ComponentFallback = memo(({ 
  title, 
  description, 
  icon,
  error 
}: {
  title: string;
  description: string;
  icon: string;
  error?: string;
}) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <div className="bg-card border rounded-lg p-8 text-center max-w-md w-full">
      <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
        {icon}
      </div>
      <h1 className="text-2xl font-semibold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6">{description}</p>
      <p className="text-sm text-muted-foreground mb-6">
        Component temporarily unavailable. Enable developer mode for full access.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => {
            localStorage.setItem('networkingbude_developer_mode', 'enabled');
            localStorage.setItem('networking_bude_permanent_dev', 'true');
            sessionStorage.setItem('networking-bude-editing', 'true');
            const url = new URL(window.location.href);
            url.searchParams.set('dev', 'true');
            window.history.replaceState({}, '', url.toString());
            window.location.reload();
          }}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors w-full"
        >
          Enable Developer Mode
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors w-full"
        >
          Back to Dashboard
        </button>
      </div>
      {error && (
        <div className="text-xs text-muted-foreground mt-4">
          Error: {error}
        </div>
      )}
    </div>
  </div>
));

ComponentFallback.displayName = 'ComponentFallback';

// Safe component wrapper
const SafeComponent = memo(({ 
  children, 
  fallbackTitle, 
  fallbackDescription, 
  fallbackIcon 
}: {
  children: React.ReactNode;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackIcon: string;
}) => (
  <ErrorBoundary
    fallback={({ error, resetError }) => (
      <ComponentFallback
        title={fallbackTitle}
        description={fallbackDescription}
        icon={fallbackIcon}
        error={error?.message}
      />
    )}
  >
    {children}
  </ErrorBoundary>
));

SafeComponent.displayName = 'SafeComponent';

// User session management hook
const useAppSession = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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
    setIsLoading(false);
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
  
  return { userData, isOnboarded, isLoading, saveSession, clearSession };
};

// Main app content
function AppContent() {
  const { userData, isOnboarded, isLoading, saveSession, clearSession } = useAppSession();
  const [isPreviewMode] = useState(true);

  const handleOnboardingComplete = useCallback((data: UserData) => {
    saveSession(data);
  }, [saveSession]);

  // Loading state
  if (isLoading) {
    return <RouteLoader />;
  }

  // Show onboarding if not completed
  if (!isOnboarded) {
    return (
      <SafeComponent
        fallbackTitle="Onboarding"
        fallbackDescription="Get started with Networking BudE"
        fallbackIcon="🚀"
      >
        <LinkedInOnboarding onComplete={handleOnboardingComplete} />
      </SafeComponent>
    );
  }

  // Main application
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Preview Mode Banner with Developer Access */}
      {isPreviewMode && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-center z-40 relative">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span>🚀 You're in Preview Mode</span>
            <span>•</span>
            <span className="font-medium">Upgrade for $9.99/month to unlock all features</span>
            <span>•</span>
            <button
              onClick={() => {
                localStorage.setItem('networkingbude_developer_mode', 'enabled');
                localStorage.setItem('networking_bude_permanent_dev', 'true');
                sessionStorage.setItem('networking-bude-editing', 'true');
                const url = new URL(window.location.href);
                url.searchParams.set('dev', 'true');
                window.history.replaceState({}, '', url.toString());
                window.location.reload();
              }}
              className="underline hover:no-underline"
            >
              Enable Dev Mode
            </button>
          </div>
        </div>
      )}
      
      {/* Mobile header */}
      <div className="block md:hidden">
        <SafeComponent
          fallbackTitle="Mobile Header"
          fallbackDescription="Navigation header"
          fallbackIcon="📱"
        >
          <MobileHeader userData={userData} onLogout={clearSession} />
        </SafeComponent>
      </div>
      
      {/* Main content */}
      <main className="flex-1">
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={
              <SafeComponent
                fallbackTitle="Dashboard"
                fallbackDescription="Your networking overview"
                fallbackIcon="🏠"
              >
                <Dashboard userData={userData} />
              </SafeComponent>
            } />
            
            {/* Events */}
            <Route path="/events" element={
              <SafeComponent
                fallbackTitle="Events"
                fallbackDescription="Discover networking events in Grand Rapids"
                fallbackIcon="📅"
              >
                <Events />
              </SafeComponent>
            } />
            
            <Route path="/events/:id" element={
              <SafeComponent
                fallbackTitle="Event Details"
                fallbackDescription="Learn more about this event"
                fallbackIcon="📅"
              >
                <EventDetail />
              </SafeComponent>
            } />
            
            {/* Connections */}
            <Route path="/connections" element={
              <SafeComponent
                fallbackTitle="Connections"
                fallbackDescription="Find and connect with professionals"
                fallbackIcon="👥"
              >
                <Matches />
              </SafeComponent>
            } />
            
            {/* User Profiles */}
            <Route path="/profile/:id" element={
              <SafeComponent
                fallbackTitle="User Profile"
                fallbackDescription="View professional profiles"
                fallbackIcon="👤"
              >
                <UserProfile />
              </SafeComponent>
            } />
            
            {/* Messaging */}
            <Route path="/messenger" element={
              <SafeComponent
                fallbackTitle="Messages"
                fallbackDescription="Communicate with your connections"
                fallbackIcon="💬"
              >
                <Messenger />
              </SafeComponent>
            } />
            
            <Route path="/messenger/:id" element={
              <SafeComponent
                fallbackTitle="Conversation"
                fallbackDescription="Chat with other professionals"
                fallbackIcon="💬"
              >
                <Conversation />
              </SafeComponent>
            } />
            
            {/* Account Management */}
            <Route path="/settings" element={
              <SafeComponent
                fallbackTitle="Account Settings"
                fallbackDescription="Manage your account preferences"
                fallbackIcon="⚙️"
              >
                <AccountSettings userData={userData} />
              </SafeComponent>
            } />
            
            {/* Payment */}
            <Route path="/payment-portal" element={
              <SafeComponent
                fallbackTitle="Payment Portal"
                fallbackDescription="Upgrade to premium features"
                fallbackIcon="💳"
              >
                <PaymentPortal />
              </SafeComponent>
            } />
            
            {/* Content Archive */}
            <Route path="/content-archive" element={
              <SafeComponent
                fallbackTitle="Content Archive"
                fallbackDescription="Browse archived content"
                fallbackIcon="📚"
              >
                <ContentArchive />
              </SafeComponent>
            } />
            
            {/* Terms */}
            <Route path="/terms" element={
              <SafeComponent
                fallbackTitle="Terms & Privacy"
                fallbackDescription="Read our terms and privacy policy"
                fallbackIcon="📄"
              >
                <TermsPage />
              </SafeComponent>
            } />
            
            <Route path="/privacy" element={
              <SafeComponent
                fallbackTitle="Terms & Privacy"
                fallbackDescription="Read our terms and privacy policy"
                fallbackIcon="📄"
              >
                <TermsPage />
              </SafeComponent>
            } />
            
            {/* 404 Page */}
            <Route path="*" element={
              <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-card border rounded-lg p-8 text-center max-w-md w-full">
                  <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    NB
                  </div>
                  <div className="text-6xl mb-4">🤔</div>
                  <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
                  <p className="text-muted-foreground mb-6">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors w-full"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      
      {/* Mobile bottom navigation */}
      <div className="block md:hidden">
        <SafeComponent
          fallbackTitle="Navigation"
          fallbackDescription="Mobile navigation"
          fallbackIcon="📱"
        >
          <MobileBottomNav />
        </SafeComponent>
      </div>
      
      {/* Desktop footer */}
      <footer className="hidden md:block bg-card border-t py-4 px-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              NB
            </div>
            <span>Networking BudE by The BudE System™</span>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.href = '/terms'}
              className="hover:text-foreground transition-colors"
            >
              Terms
            </button>
            <button 
              onClick={() => window.location.href = '/privacy'}
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => {
                console.log('🔧 Networking BudE Developer Console Commands:');
                console.log('• NetworkingBudE.enableDeveloperMode() - Enable permanent developer access');
                console.log('• NetworkingBudE.disableDeveloperMode() - Disable developer access');
                console.log('• NetworkingBudE.status() - Check current developer mode status');
              }}
              className="hover:text-foreground transition-colors"
            >
              Developer
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App component
export default function App() {
  // Service worker registration for PWA features
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silent fail for development
      });
    }
  }, []);

  // Developer console access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).NetworkingBudE = {
        enableDeveloperMode: () => {
          localStorage.setItem('networkingbude_developer_mode', 'enabled');
          localStorage.setItem('networking_bude_permanent_dev', 'true');
          sessionStorage.setItem('networking-bude-editing', 'true');
          const url = new URL(window.location.href);
          url.searchParams.set('dev', 'true');
          window.history.replaceState({}, '', url.toString());
          window.location.reload();
          return '🔓 Developer mode enabled permanently! Full access unlocked.';
        },
        disableDeveloperMode: () => {
          localStorage.removeItem('networkingbude_developer_mode');
          localStorage.removeItem('networking_bude_permanent_dev');
          sessionStorage.removeItem('networking-bude-editing');
          const url = new URL(window.location.href);
          url.searchParams.delete('dev');
          window.history.replaceState({}, '', url.toString());
          window.location.reload();
          return '🔒 Developer mode disabled. Premium features require subscription.';
        },
        status: () => {
          const isDevMode = localStorage.getItem('networkingbude_developer_mode') === 'enabled';
          const isPermanent = localStorage.getItem('networking_bude_permanent_dev') === 'true';
          const hasEditingSession = sessionStorage.getItem('networking-bude-editing') !== null;
          const urlParams = new URLSearchParams(window.location.search);
          const hasDevParam = urlParams.get('dev') === 'true';
          
          return {
            isDeveloperMode: isDevMode || isPermanent || hasEditingSession || hasDevParam,
            persistent: isPermanent,
            sessionActive: hasEditingSession,
            urlParameter: hasDevParam,
            message: (isDevMode || isPermanent || hasEditingSession || hasDevParam) 
              ? '✅ Developer mode is ACTIVE - Full access enabled'
              : '❌ Developer mode is INACTIVE - Limited preview access'
          };
        },
        clearAllData: () => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
          return '🧹 All app data cleared and reloaded';
        },
        forceReload: () => {
          window.location.reload();
          return '🔄 App reloaded';
        }
      };
      
      // Auto-log available commands
      console.log('🔧 Networking BudE Developer Console:');
      console.log('• NetworkingBudE.enableDeveloperMode() - Enable full access');
      console.log('• NetworkingBudE.disableDeveloperMode() - Disable developer access');
      console.log('• NetworkingBudE.status() - Check current access level');
      console.log('• NetworkingBudE.clearAllData() - Clear all app data');
      console.log('• NetworkingBudE.forceReload() - Force app reload');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}