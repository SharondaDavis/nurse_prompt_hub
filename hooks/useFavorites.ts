import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper to fetch current user's favorites
    async function fetchFavorites() {
      setLoading(true);
      const user = supabase.auth.user();
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('prompt_id')
        .eq('user_id', user.id);

      if (!error && data) {
        setFavorites(data.map((row) => row.prompt_id));
      }
      setLoading(false);
    }

    // Listen for real-time changes
    const user = supabase.auth.user();
    let subscription: any;
    if (user) {
      subscription = supabase
        .from(`favorites:user_id=eq.${user.id}`)
        .on('INSERT', fetchFavorites)
        .on('DELETE', fetchFavorites)
        .subscribe();
    }

    fetchFavorites();
    return () => {
      if (subscription) supabase.removeSubscription(subscription);
    };
  }, []);

  // Add & remove functions
  const addFavorite = async (promptId: string) => {
    const user = supabase.auth.user();
    if (!user) return;
    await supabase.from('favorites').insert([
      { user_id: user.id, prompt_id: promptId }
    ]);
  };

  const removeFavorite = async (promptId: string) => {
    const user = supabase.auth.user();
    if (!user) return;
    await supabase
      .from('favorites')
      .delete()
      .match({ user_id: user.id, prompt_id: promptId });
  };

  return { favorites, loading, addFavorite, removeFavorite };
}
