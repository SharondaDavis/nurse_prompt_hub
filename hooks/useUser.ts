import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

// Mock user for demo when Supabase is not configured
const mockUser = {
  id: 'demo-user',
  email: 'demo@nursehub.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email_confirmed_at: new Date().toISOString(), // Mock as confirmed
} as User;

const mockProfile: UserProfile = {
  id: 'demo-user',
  username: 'demo_nurse_rn',
  full_name: 'Demo Nurse',
  specialty: 'General Practice',
  years_experience: 5,
  bio: 'Experienced nurse passionate about sharing knowledge and best practices.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Check if Supabase is properly configured
    const isSupabaseConfigured = 
      process.env.EXPO_PUBLIC_SUPABASE_URL && 
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

    if (!isSupabaseConfigured) {
      // Use mock data when Supabase is not configured
      setTimeout(() => {
        if (mountedRef.current) {
          setUser(mockUser);
          setProfile(mockProfile);
          setIsLoading(false);
        }
      }, 1000); // Simulate loading time
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;
      
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        
        console.log('Auth state changed:', event, session?.user?.email_confirmed_at);
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!mountedRef.current) return;

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      if (!mountedRef.current) return;
      
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !mountedRef.current) return;

    // Check if Supabase is properly configured
    const isSupabaseConfigured = 
      process.env.EXPO_PUBLIC_SUPABASE_URL && 
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

    if (!isSupabaseConfigured) {
      // Mock update for demo
      const updatedProfile = { ...mockProfile, ...updates };
      setProfile(updatedProfile);
      return updatedProfile;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          username: updates.username || profile?.username || 'new_user',
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      if (mountedRef.current) {
        setProfile(data);
      }
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const signOut = async () => {
    // Check if Supabase is properly configured
    const isSupabaseConfigured = 
      process.env.EXPO_PUBLIC_SUPABASE_URL && 
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

    if (!isSupabaseConfigured) {
      // Mock sign out for demo
      setUser(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
  };

  return {
    user,
    profile,
    isLoading,
    updateProfile,
    signOut,
  };
}