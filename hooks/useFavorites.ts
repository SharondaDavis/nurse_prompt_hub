import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface FavoritePrompt {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  votes: number;
  savedAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritePrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  // Mock data for when Supabase is not configured
  const mockFavorites: FavoritePrompt[] = [
    {
      id: 'fav-1',
      title: 'Code Blue Response Protocol',
      category: 'Code Blue Debrief',
      excerpt: 'A comprehensive guide for handling code blue situations with confidence and clarity...',
      votes: 24,
      savedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'fav-2',
      title: 'Post-Shift Mindfulness Guide',
      category: 'Self-Care',
      excerpt: 'Techniques for decompressing and maintaining mental health after challenging shifts...',
      votes: 18,
      savedAt: '2024-01-14T16:45:00Z',
    },
    {
      id: 'fav-3',
      title: 'ICU Handoff Excellence',
      category: 'Shift Report Prep',
      excerpt: 'Best practices for comprehensive and efficient ICU patient handoffs...',
      votes: 31,
      savedAt: '2024-01-12T08:20:00Z',
    },
  ];

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        // Use mock data when Supabase is not configured
        setTimeout(() => {
          setFavorites(mockFavorites);
          setLoading(false);
        }, 1000); // Simulate loading time
        return;
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Fetch user's favorites from Supabase
      const { data, error: fetchError } = await supabase
        .from('user_favorites')
        .select(`
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
        throw fetchError;
      }

      // Transform the data to match our interface
      const transformedFavorites: FavoritePrompt[] = data?.map(item => ({
        id: item.prompt_id,
        title: item.prompts.title,
        category: item.prompts.category,
        excerpt: item.prompts.content.substring(0, 150) + '...',
        votes: item.prompts.votes,
        savedAt: item.created_at,
      })) || [];

      setFavorites(transformedFavorites);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (promptId: string) => {
    try {
      setError(null);

      if (!isSupabaseConfigured) {
        // Mock adding favorite
        const mockPrompt: FavoritePrompt = {
          id: promptId,
          title: `Mock Prompt ${promptId}`,
          category: 'General',
          excerpt: 'This is a mock prompt for demonstration purposes...',
          votes: Math.floor(Math.random() * 50),
          savedAt: new Date().toISOString(),
        };
        
        setFavorites(prev => [mockPrompt, ...prev]);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if already favorited
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
        .single();

      if (existing) {
        throw new Error('Prompt is already in favorites');
      }

      // Add to favorites
      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          prompt_id: promptId,
        });

      if (insertError) {
        throw insertError;
      }

      // Reload favorites to get the updated list
      await loadFavorites();
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to add favorite');
      throw err;
    }
  };

  const removeFavorite = async (promptId: string) => {
    try {
      setError(null);

      if (!isSupabaseConfigured) {
        // Mock removing favorite
        setFavorites(prev => prev.filter(fav => fav.id !== promptId));
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('prompt_id', promptId);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setFavorites(prev => prev.filter(fav => fav.id !== promptId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove favorite');
      throw err;
    }
  };

  const isFavorited = (promptId: string): boolean => {
    return favorites.some(fav => fav.id === promptId);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorited,
    clearError,
    refetch: loadFavorites,
  };
}