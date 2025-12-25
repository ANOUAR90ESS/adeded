
import { supabase } from './supabase';
import { UserProfile } from '../types';

export const signIn = async (email: string, password: string) => {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const resetPasswordForEmail = async (email: string) => {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch the profile data from the 'profiles' table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // EMERGENCY FALLBACK: If DB fetch fails but email matches admin list, grant admin
  if (error || !profile) {
    // Silently handle profile fetch errors for security (no console logging)

    // Get admin emails from environment
    const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '';
    const adminEmails = adminEmailsEnv.split(',').map((e: string) => e.trim()).filter(Boolean);

    if (user.email && adminEmails.includes(user.email)) {
        return {
            id: user.id,
            email: user.email || '',
            role: 'admin',
            // Payment fields removed - App is now 100% free
        };
    }

    // Fallback if profile trigger failed or table doesn't exist yet
    return {
      id: user.id,
      email: user.email || '',
      role: 'user',
      // Payment fields removed - App is now 100% free
    };
  }

  // Force admin for owner email if DB record exists but says user (safety check)
  const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '';
  const adminEmails = adminEmailsEnv.split(',').map((e: string) => e.trim()).filter(Boolean);
  const role = (user.email && adminEmails.includes(user.email)) ? 'admin' : (profile.role as 'user' | 'admin');

  return {
    id: user.id,
    email: user.email || '',
    role: role,
    // Payment fields removed - App is now 100% free with unlimited access
  };
};
