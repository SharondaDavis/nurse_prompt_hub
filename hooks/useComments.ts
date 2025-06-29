import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from './useUser';

export interface Comment {
  id: string;
  prompt_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  username?: string;
  full_name?: string;
  specialty?: string;
}

export function useComments(promptId?: string) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  useEffect(() => {
    if (promptId) {
      loadComments();
    }
  }, [promptId]);

  const loadComments = async () => {
    if (!promptId) return;

    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        // Mock data for demo mode
        const mockComments: Comment[] = [
          {
            id: '1',
            prompt_id: promptId,
            user_id: 'user1',
            content: 'This prompt has been incredibly helpful during my shifts in the ICU. The structured approach helps me stay focused during high-stress situations.',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            username: 'sarah_icu_rn',
            full_name: 'Sarah Johnson',
            specialty: 'ICU',
          },
          {
            id: '2',
            prompt_id: promptId,
            user_id: 'user2',
            content: 'I\'ve been using this with my nursing students to help them develop critical thinking skills. Great resource!',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            username: 'prof_nursing',
            full_name: 'Professor Williams',
            specialty: 'Education',
          },
          {
            id: '3',
            prompt_id: promptId,
            user_id: 'user3',
            content: 'Would love to see a version of this adapted for pediatric settings. The core concepts are solid though!',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            username: 'peds_nurse_amy',
            full_name: 'Amy Chen',
            specialty: 'Pediatrics',
          },
        ];
        
        setTimeout(() => {
          setComments(mockComments);
          setCommentCount(mockComments.length);
          setLoading(false);
        }, 500);
        return;
      }

      // Fetch comments from Supabase
      const { data, error: fetchError } = await supabase
        .from('comments_with_users')
        .select('*')
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setComments(data || []);
      setCommentCount(data?.length || 0);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string): Promise<Comment | null> => {
    if (!promptId || !user) {
      throw new Error('User must be authenticated to comment');
    }

    if (!content.trim()) {
      throw new Error('Comment cannot be empty');
    }

    try {
      setError(null);

      if (!isSupabaseConfigured) {
        // Mock adding comment for demo
        const newComment: Comment = {
          id: `temp-${Date.now()}`,
          prompt_id: promptId,
          user_id: user.id,
          content: content.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          username: 'current_user',
          full_name: 'Current User',
          specialty: 'General',
        };
        
        setComments(prev => [newComment, ...prev]);
        setCommentCount(prev => prev + 1);
        return newComment;
      }

      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          prompt_id: promptId,
          content: content.trim(),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Reload comments to get the updated list with user info
      await loadComments();
      
      return data as Comment;
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      return null;
    }
  };

  const updateComment = async (commentId: string, content: string): Promise<Comment | null> => {
    if (!user) {
      throw new Error('User must be authenticated to update comment');
    }

    if (!content.trim()) {
      throw new Error('Comment cannot be empty');
    }

    try {
      setError(null);

      if (!isSupabaseConfigured) {
        // Mock updating comment for demo
        const updatedComments = comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, content: content.trim(), updated_at: new Date().toISOString() } 
            : comment
        );
        
        setComments(updatedComments);
        const updatedComment = updatedComments.find(c => c.id === commentId);
        return updatedComment || null;
      }

      const { data, error: updateError } = await supabase
        .from('comments')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user can only update their own comments
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId ? { ...comment, ...data } : comment
        )
      );
      
      return data as Comment;
    } catch (err) {
      console.error('Error updating comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update comment');
      return null;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    if (!user) {
      throw new Error('User must be authenticated to delete comment');
    }

    try {
      setError(null);

      if (!isSupabaseConfigured) {
        // Mock deleting comment for demo
        setComments(prev => prev.filter(comment => comment.id !== commentId));
        setCommentCount(prev => Math.max(0, prev - 1));
        return true;
      }

      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only delete their own comments

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setCommentCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      return false;
    }
  };

  const isUserComment = (commentId: string): boolean => {
    if (!user) return false;
    return comments.some(comment => comment.id === commentId && comment.user_id === user.id);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    comments,
    commentCount,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    isUserComment,
    clearError,
    refresh: loadComments,
  };
}