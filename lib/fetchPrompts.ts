import { supabase } from './supabaseClient';
import { Database } from '@/types/database';
import { mockPrompts, mockUserProfiles } from './mockData';

type Prompt = Database['public']['Tables']['prompts']['Row'];

// Extended prompt type with user profile information
export interface PromptWithUser extends Prompt {
  user_profiles?: {
    username: string;
    full_name?: string;
    specialty?: string;
  };
}

export interface FetchPromptsOptions {
  category?: string;
  specialty?: string;
  search?: string;
  limit?: number;
  offset?: number;
  userId?: string; // Add userId option for filtering user's prompts
}

export async function fetchPrompts(options: FetchPromptsOptions = {}): Promise<PromptWithUser[]> {
  const { category, specialty, search, limit = 5, offset = 0, userId } = options;
  
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Return mock data when Supabase is not configured
    let filtered = [...mockPrompts];

    // Filter by user if userId is provided
    if (userId) {
      filtered = filtered.filter(prompt => prompt.created_by === userId);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === category);
    }

    if (specialty && specialty !== 'all') {
      filtered = filtered.filter(prompt => prompt.specialty === specialty);
    }

    if (search && search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Add mock user profile data
    const promptsWithUsers: PromptWithUser[] = filtered.slice(offset, offset + limit).map(prompt => {
      // Handle built-in prompts (created_by is null) and anonymous prompts
      if (!prompt.created_by || prompt.is_anonymous) {
        return {
          ...prompt,
          user_profiles: undefined, // No user profile for built-in or anonymous prompts
        };
      }

      const userProfile = mockUserProfiles.find(profile => profile.id === prompt.created_by);
      return {
        ...prompt,
        user_profiles: userProfile ? {
          username: userProfile.username,
          full_name: userProfile.full_name,
          specialty: userProfile.specialty,
        } : {
          username: 'anonymous_nurse',
          full_name: 'Anonymous Nurse',
          specialty: 'General',
        }
      };
    });

    return promptsWithUsers;
  }

  // Use Supabase when properly configured
  let query = supabase
    .from('prompts')
    .select(`
      *,
      user_profiles (
        username,
        full_name,
        specialty
      )
    `);

  // Apply full-text search if search term is provided
  if (search && search.trim()) {
    // Use full-text search with tsvector for better performance and relevance
    query = query.textSearch('prompt_vector', search.trim(), {
      type: 'websearch', // Supports phrases, AND/OR operators, and quoted strings
      config: 'english'
    });
  }

  // Filter by user if userId is provided
  if (userId) {
    query = query.eq('created_by', userId);
  }

  // Apply category filter
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // Apply specialty filter
  if (specialty && specialty !== 'all') {
    query = query.eq('specialty', specialty);
  }

  // Order by relevance for search queries, otherwise by creation date
  if (search && search.trim()) {
    // For search queries, PostgreSQL will automatically order by relevance (ts_rank)
    // We can add a secondary sort by created_at for ties
    query = query.order('created_at', { ascending: false });
  } else {
    // For non-search queries, order by creation date
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching prompts:', error);
    throw error;
  }

  return data as PromptWithUser[];
}

export async function fetchPromptsByUser(userId: string): Promise<PromptWithUser[]> {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    const filtered = mockPrompts.filter(prompt => prompt.created_by === userId);
    return filtered.map(prompt => {
      if (!prompt.created_by || prompt.is_anonymous) {
        return {
          ...prompt,
          user_profiles: undefined,
        };
      }

      const userProfile = mockUserProfiles.find(profile => profile.id === prompt.created_by);
      return {
        ...prompt,
        user_profiles: userProfile ? {
          username: userProfile.username,
          full_name: userProfile.full_name,
          specialty: userProfile.specialty,
        } : {
          username: 'anonymous_nurse',
          full_name: 'Anonymous Nurse',
          specialty: 'General',
        }
      };
    });
  }

  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      user_profiles (
        username,
        full_name,
        specialty
      )
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user prompts:', error);
    throw error;
  }

  return data as PromptWithUser[];
}

export async function fetchPromptById(id: string): Promise<PromptWithUser | null> {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    const prompt = mockPrompts.find(prompt => prompt.id === id);
    if (!prompt) return null;
    
    if (!prompt.created_by || prompt.is_anonymous) {
      return {
        ...prompt,
        user_profiles: undefined,
      };
    }

    const userProfile = mockUserProfiles.find(profile => profile.id === prompt.created_by);
    return {
      ...prompt,
      user_profiles: userProfile ? {
        username: userProfile.username,
        full_name: userProfile.full_name,
        specialty: userProfile.specialty,
      } : {
        username: 'anonymous_nurse',
        full_name: 'Anonymous Nurse',
        specialty: 'General',
      }
    };
  }

  const { data, error } = await supabase
    .from('prompts')
    .select(`
      *,
      user_profiles (
        username,
        full_name,
        specialty
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching prompt:', error);
    throw error;
  }

  return data as PromptWithUser;
}

// New function to get total count for pagination
export async function getTotalPromptsCount(options: Omit<FetchPromptsOptions, 'limit' | 'offset'> = {}) {
  const { category, specialty, search, userId } = options;
  
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Return mock data count when Supabase is not configured
    let filtered = [...mockPrompts];

    if (userId) {
      filtered = filtered.filter(prompt => prompt.created_by === userId);
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === category);
    }

    if (specialty && specialty !== 'all') {
      filtered = filtered.filter(prompt => prompt.specialty === specialty);
    }

    if (search && search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.length;
  }

  // Use Supabase when properly configured
  let query = supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true });

  // Apply full-text search if search term is provided
  if (search && search.trim()) {
    query = query.textSearch('prompt_vector', search.trim(), {
      type: 'websearch',
      config: 'english'
    });
  }

  if (userId) {
    query = query.eq('created_by', userId);
  }

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (specialty && specialty !== 'all') {
    query = query.eq('specialty', specialty);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error fetching prompts count:', error);
    throw error;
  }

  return count || 0;
}

export async function voteOnPrompt(promptId: string, increment: boolean = true) {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock voting for demo purposes
    const prompt = mockPrompts.find(p => p.id === promptId);
    if (prompt) {
      prompt.votes = increment ? prompt.votes + 1 : Math.max(0, prompt.votes - 1);
      return prompt;
    }
    throw new Error('Prompt not found');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // First, get the current vote count
  const { data: currentPrompt, error: fetchError } = await supabase
    .from('prompts')
    .select('votes')
    .eq('id', promptId)
    .single();

  if (fetchError) {
    console.error('Error fetching current votes:', fetchError);
    throw fetchError;
  }

  // Update the vote count
  const newVoteCount = increment 
    ? currentPrompt.votes + 1 
    : Math.max(0, currentPrompt.votes - 1);

  const { data, error } = await supabase
    .from('prompts')
    .update({ votes: newVoteCount })
    .eq('id', promptId)
    .select()
    .single();

  if (error) {
    console.error('Error updating votes:', error);
    throw error;
  }

  return data;
}

// Enhanced search function with advanced full-text search capabilities
export async function searchPrompts(
  searchTerm: string,
  page = 0,
  pageSize = 20,
  options: Omit<FetchPromptsOptions, 'search' | 'limit' | 'offset'> = {}
): Promise<PromptWithUser[]> {
  const start = page * pageSize;
  
  return fetchPrompts({
    ...options,
    search: searchTerm,
    limit: pageSize,
    offset: start,
  });
}