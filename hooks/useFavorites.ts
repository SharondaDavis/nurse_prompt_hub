import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from './useUser';

export interface Favorite {
  id: string;
  user_id: string;
  prompt_id: string;
  created_at: string;
  prompts: {
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

  const loadFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

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

  const isFavorite = (promptId: string) => {
    return favorites.some(fav => fav.prompt_id === promptId);
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: loadFavorites,
  };
}