import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from './useUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Favorite {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: string;
  prompts?: {
    id: string;
    title: string;
    category: string;
    content: string;
    votes: number;
  };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        // Use local storage for demo mode
        try {
          const storedFavorites = await AsyncStorage.getItem('favorites');
          if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
          } else {
            setFavorites([]);
          }
        } catch (err) {
          console.error('Error loading favorites from storage:', err);
          setFavorites([]);
        }
        setLoading(false);
        return;
      }

      // Use Supabase when properly configured
      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          prompt_id,
          created_at,
          prompts (
            id,
            title,
            category,
            content,
            votes
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error loading favorites:', fetchError);
        setError(fetchError.message);
        return;
      }

      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (promptId: string) => {
    if (!user) return false;

    try {
      if (!isSupabaseConfigured) {
        // Use local storage for demo mode
        const newFavorite: Favorite = {
          id: `fav-${Date.now()}`,
          user_id: user.id,
          prompt_id: promptId,
          created_at: new Date().toISOString(),
        };
        
        const updatedFavorites = [...favorites, newFavorite];
        setFavorites(updatedFavorites);
        
        try {
          await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        } catch (err) {
          console.error('Error saving favorites to storage:', err);
        }
        
        return true;
      }

      // Use Supabase when properly configured
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          prompt_id: promptId,
        });

      if (error) {
        console.error('Error adding favorite:', error);
        return false;
      }

      await loadFavorites();
      return true;
    } catch (err) {
      console.error('Error adding favorite:', err);
      return false;
    }
  };

  const removeFavorite = async (promptId: string) => {
    if (!user) return false;

    try {
      if (!isSupabaseConfigured) {
        // Use local storage for demo mode
        const updatedFavorites = favorites.filter(fav => fav.prompt_id !== promptId);
        setFavorites(updatedFavorites);
        
        try {
          await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        } catch (err) {
          console.error('Error saving favorites to storage:', err);
        }
        
        return true;
      }

      // Use Supabase when properly configured
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('prompt_id', promptId);

      if (error) {
        console.error('Error removing favorite:', error);
        return false;
      }

      await loadFavorites();
      return true;
    } catch (err) {
      console.error('Error removing favorite:', err);
      return false;
    }
  };

  const isFavorited = (promptId: string) => {
    return favorites.some(fav => fav.prompt_id === promptId);
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorited,
    refetch: loadFavorites,
  };
}