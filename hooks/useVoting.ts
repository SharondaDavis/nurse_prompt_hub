import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from './useUser';

export interface VoteData {
  promptId: string;
  hasVoted: boolean;
  voteCount: number;
}

export function useVoting() {
  const { user } = useUser();
  const [votes, setVotes] = useState<string[]>([]); // Array of prompt IDs the user has voted on
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({}); // Vote counts by prompt ID
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  useEffect(() => {
    if (user && isSupabaseConfigured) {
      loadUserVotes();
    } else if (!isSupabaseConfigured) {
      // Mock data for demo mode
      setVotes(['1', '3', '5']); // Mock some voted prompts
    }
  }, [user, isSupabaseConfigured]);

  const loadUserVotes = async () => {
    if (!user || !isSupabaseConfigured) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('votes')
        .select('prompt_id')
        .eq('user_id', user.id);

      if (fetchError) {
        throw fetchError;
      }

      const userVotes = data?.map(vote => vote.prompt_id) || [];
      setVotes(userVotes);
    } catch (err) {
      console.error('Error loading user votes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load votes');
    } finally {
      setLoading(false);
    }
  };

  const getVoteCount = async (promptId: string): Promise<number> => {
    if (!isSupabaseConfigured) {
      // Return mock vote count for demo
      const mockCounts: Record<string, number> = {
        '1': 24, '2': 42, '3': 35, '4': 31, '5': 27, '6': 18, '7': 29, '8': 22, '9': 15
      };
      return mockCounts[promptId] || Math.floor(Math.random() * 50) + 1;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_prompt_vote_count', { prompt_uuid: promptId });

      if (error) {
        throw error;
      }

      const count = data || 0;
      setVoteCounts(prev => ({ ...prev, [promptId]: count }));
      return count;
    } catch (err) {
      console.error('Error getting vote count:', err);
      return 0;
    }
  };

  const addVote = async (promptId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be authenticated to vote');
    }

    if (!isSupabaseConfigured) {
      // Mock adding vote for demo
      setVotes(prev => [...prev, promptId]);
      setVoteCounts(prev => ({ 
        ...prev, 
        [promptId]: (prev[promptId] || 0) + 1 
      }));
      return true;
    }

    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          prompt_id: promptId,
        });

      if (insertError) {
        // Handle duplicate vote error gracefully
        if (insertError.code === '23505') {
          throw new Error('You have already voted on this prompt');
        }
        throw insertError;
      }

      // Update local state optimistically
      setVotes(prev => [...prev, promptId]);
      setVoteCounts(prev => ({ 
        ...prev, 
        [promptId]: (prev[promptId] || 0) + 1 
      }));

      // Refresh vote count from server
      await getVoteCount(promptId);
      
      return true;
    } catch (err) {
      console.error('Error adding vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to add vote');
      throw err;
    }
  };

  const removeVote = async (promptId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be authenticated to remove vote');
    }

    if (!isSupabaseConfigured) {
      // Mock removing vote for demo
      setVotes(prev => prev.filter(id => id !== promptId));
      setVoteCounts(prev => ({ 
        ...prev, 
        [promptId]: Math.max(0, (prev[promptId] || 0) - 1)
      }));
      return true;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', user.id)
        .eq('prompt_id', promptId);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state optimistically
      setVotes(prev => prev.filter(id => id !== promptId));
      setVoteCounts(prev => ({ 
        ...prev, 
        [promptId]: Math.max(0, (prev[promptId] || 0) - 1)
      }));

      // Refresh vote count from server
      await getVoteCount(promptId);
      
      return true;
    } catch (err) {
      console.error('Error removing vote:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove vote');
      throw err;
    }
  };

  const toggleVote = async (promptId: string): Promise<boolean> => {
    const hasVoted = votes.includes(promptId);
    
    if (hasVoted) {
      return await removeVote(promptId);
    } else {
      return await addVote(promptId);
    }
  };

  const hasVoted = (promptId: string): boolean => {
    return votes.includes(promptId);
  };

  const getVoteCountSync = (promptId: string): number => {
    return voteCounts[promptId] || 0;
  };

  const clearError = () => {
    setError(null);
  };

  return {
    votes,
    voteCounts,
    loading,
    error,
    addVote,
    removeVote,
    toggleVote,
    hasVoted,
    getVoteCount,
    getVoteCountSync,
    clearError,
    refetch: loadUserVotes,
  };
}