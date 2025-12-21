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

    const fetchProfile = async (userId: string): Promise<Profile | null> => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Return a default profile if not found
          return {
            id: userId,
            email: '',
            role: 'viewer' as UserRole,
            created_at: new Date().toISOString(),
          };
        }
        return data;
      } catch (err) {
        console.error('Exception fetching profile:', err);
        return null;
      }
    };

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              session: null,
              loading: false,
              error: error.message,
            });
          }
          return;
        }

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
      } catch (err) {
        console.error('Exception in initAuth:', err);
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: 'Failed to initialize authentication',
          });
        }
      }
    };

    // Initialize
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

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
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
