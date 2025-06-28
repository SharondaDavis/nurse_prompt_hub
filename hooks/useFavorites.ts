// hooks/useFavorites.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current user's favorites
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
        setFavorites(data.map((row: { prompt_id: string }) => row.prompt_id));
      }
      setLoading(false);
    }

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

  // Add a favorite
  const addFavorite = async (promptId: string) => {
    const user = supabase.auth.user();
    if (!user) return;
    await supabase.from('favorites').insert([
      { user_id: user.id, prompt_id: promptId }
    ]);
  };

  // Remove a favorite
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
