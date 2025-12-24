import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'viewer' | 'editor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Task {
  id: number;
  sheet: string;
  job: string | null;
  phase: string | null;
  crew: string | null;
  description: string | null;
  status: string | null;
  weeks: number | null;
  start_date: string | null;
  end_date: string | null;
  daily_revenue: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const canAddJobs = (role: UserRole): boolean => {
  return role === 'editor' || role === 'admin';
};

export const canEditJobs = (role: UserRole): boolean => {
  return role === 'admin';
};

export const canDeleteJobs = (role: UserRole): boolean => {
  return role === 'admin';
};

export const canManageUsers = (role: UserRole): boolean => {
  return role === 'admin';
};
