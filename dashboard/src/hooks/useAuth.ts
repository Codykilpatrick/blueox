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

  useEffect(() => {
    let mounted = true;
    const hasInitialized = { current: false };

    const fetchProfile = async (userId: string): Promise<Profile> => {
      const defaultProfile: Profile = {
        id: userId,
        email: '',
        role: 'viewer' as UserRole,
        created_at: new Date().toISOString(),
      };

      try {
        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) => {
          setTimeout(
            () => resolve({ data: null, error: new Error('Profile fetch timeout') }),
            3000
          );
        });

        const fetchPromise = supabase.from('profiles').select('*').eq('id', userId).single();

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

        if (error || !data) {
          return defaultProfile;
        }
        return data as Profile;
      } catch {
        return defaultProfile;
      }
    };

    const handleAuthChange = async (session: Session | null) => {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleAuthChange(session);
    });

    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          if (mounted) {
            setAuthState((prev) => ({ ...prev, loading: false, error: error.message }));
          }
          return;
        }

        if (mounted && !hasInitialized.current) {
          hasInitialized.current = true;
          await handleAuthChange(data.session);
        }
      } catch {
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

    const timer = setTimeout(checkSession, 100);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

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
    } catch {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to sign in',
      }));
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore sign out errors
    }
    setAuthState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null,
    });
  };

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
