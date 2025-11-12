import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Session timeout configuration
const INACTIVITY_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    if (user && !rememberMe) {
      const now = Date.now();
      localStorage.setItem('lastActivity', now.toString());
    }
  }, [user, rememberMe]);

  // Check if session should timeout due to inactivity
  const checkInactivity = useCallback(async () => {
    if (!user || rememberMe) return;

    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) {
      // First time, set activity
      updateActivity();
      return;
    }

    const timeSinceActivity = Date.now() - parseInt(lastActivity);

    if (timeSinceActivity > INACTIVITY_TIMEOUT) {
      console.log('Session timeout due to inactivity');

      // Sign out using Supabase directly
      await supabase.auth.signOut();

      // Clear localStorage
      localStorage.removeItem('onboardingCompleted');
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('rememberMe');

      // Reset state
      setRememberMe(false);

      alert('Your session has expired due to inactivity. Please sign in again.');
    }
  }, [user, rememberMe, updateActivity]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Check for remember me preference
      if (session?.user) {
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
        setRememberMe(savedRememberMe);

        if (!savedRememberMe) {
          updateActivity();
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
        setRememberMe(savedRememberMe);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    // Activity events to track
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Throttle activity updates to avoid excessive writes
    let activityTimeout;
    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        updateActivity();
      }, 5000); // Update at most every 5 seconds
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, true);
    });

    // Initial activity update
    updateActivity();

    // Check for inactivity periodically
    const inactivityInterval = setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL);

    return () => {
      // Cleanup
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity, true);
      });
      clearInterval(inactivityInterval);
      clearTimeout(activityTimeout);
    };
  }, [user, updateActivity, checkInactivity]);

  const signUp = async (email, password, userData) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user && authData.session) {
        // Wait a bit for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('🔍 Attempting to insert user profile with data:', {
          id: authData.user.id,
          email: email,
          ...userData
        });

        // Insert user profile data using the session
        const { data: insertedData, error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: email,
            ...userData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (profileError) {
          console.error('❌ Profile insert error:', profileError);
          console.error('❌ Error details:', JSON.stringify(profileError, null, 2));
          throw profileError;
        }

        console.log('✅ Profile inserted successfully:', insertedData);
        
        // Default settings are automatically created by the database trigger
        // No need to manually insert - the trigger handles it
        console.log('✅ Default user settings will be created by database trigger');
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email, password, rememberMeOption = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Save remember me preference
      setRememberMe(rememberMeOption);
      localStorage.setItem('rememberMe', rememberMeOption.toString());

      // If not remembering, set initial activity timestamp
      if (!rememberMeOption) {
        localStorage.setItem('lastActivity', Date.now().toString());
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear localStorage
      localStorage.removeItem('onboardingCompleted');
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('rememberMe');

      // Reset state
      setRememberMe(false);

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  };

  const value = {
    user,
    loading,
    rememberMe,
    setRememberMe,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
