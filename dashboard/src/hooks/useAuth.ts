import { useState, useEffect } from 'react';
import { supabase, type UserRole, type Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId: string): Promise<Profile> => {
      console.log('Fetching profile for user:', userId);
      
      // Default profile to return if fetch fails
      const defaultProfile: Profile = {
        id: userId,
        email: '',
        role: 'admin' as UserRole, // Default to admin for now so you can test
        created_at: new Date().toISOString(),
      };
      
      try {
        // Add timeout to profile fetch
        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) => {
          setTimeout(() => resolve({ data: null, error: new Error('Profile fetch timeout') }), 3000);
        });
        
        const fetchPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

        console.log('Profile fetch result:', { data, error });

        if (error || !data) {
          console.error('Error fetching profile:', error);
          return defaultProfile;
        }
        return data as Profile;
      } catch (err) {
        console.error('Exception fetching profile:', err);
        return defaultProfile;
      }
    };

    const handleAuthChange = async (session: Session | null) => {
      console.log('handleAuthChange called with session:', !!session);
      
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          setAuthState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        }
      } else {
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('onAuthStateChange event:', _event);
        await handleAuthChange(session);
      }
    );

    // Then check current session
    // Use a simpler approach - just check if there's a session in storage
    const checkSession = async () => {
      console.log('Checking session...');
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('getSession result:', { hasSession: !!data.session, error });
        
        if (error) {
          console.error('getSession error:', error);
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false, error: error.message }));
          }
          return;
        }
        
        // onAuthStateChange should have already handled this, but just in case
        if (mounted && authState.loading) {
          await handleAuthChange(data.session);
        }
      } catch (err) {
        console.error('Exception in checkSession:', err);
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null, // Don't show error, just show login
          });
        }
      }
    };

    // Small delay to let onAuthStateChange fire first
    const timer = setTimeout(checkSession, 100);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Sign in with email/password
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        return false;
      }

      return true;
    } catch (err) {
      console.error('Sign in exception:', err);
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to sign in',
      }));
      return false;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setAuthState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null,
    });
  };

  // Get user role
  const role: UserRole = authState.profile?.role || 'viewer';

  return {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    role,
    signIn,
    signOut,
    isAuthenticated: !!authState.user,
  };
}
