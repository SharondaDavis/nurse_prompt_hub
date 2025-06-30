import { supabase } from './supabaseClient';
import { Database } from '@/types/database';
import { mockPrompts, mockUserProfiles } from './mockData';

type Prompt = Database['public']['Tables']['prompts']['Row'];

// Extended prompt type with user profile information and vote count
export interface PromptWithUser extends Prompt {
  user_profiles?: {
    username: string;
    full_name?: string;
    specialty?: string;
  };
  votes_count?: number; // Add vote count to the interface
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
      filtered = filtered.filter(prompt => {
        // Handle both short category IDs and full category names
        const promptCategory = prompt.category.toLowerCase();
        const searchCategory = category.toLowerCase();
        
        // Check if the category matches exactly or if it's a substring
        return promptCategory === searchCategory || 
               promptCategory.includes(searchCategory) ||
               searchCategory.includes(promptCategory);
      });
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

    // Sort by votes (descending) then by created_at (descending)
    filtered.sort((a, b) => {
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Add mock user profile data and vote counts
    const promptsWithUsers: PromptWithUser[] = filtered.slice(offset, offset + limit).map(prompt => {
      // Handle built-in prompts (created_by is null) and anonymous prompts
      if (!prompt.created_by || prompt.is_anonymous) {
        return {
          ...prompt,
          user_profiles: undefined, // No user profile for built-in or anonymous prompts
          votes_count: prompt.votes, // Use the votes field as votes_count
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
        },
        votes_count: prompt.votes, // Use the votes field as votes_count
      };
    });

    return promptsWithUsers;
  }

  // Use Supabase when properly configured
  try {
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
      // Handle both short category IDs and full category names
      // Use ilike for case-insensitive matching
      query = query.ilike('category', `%${category}%`);
    }

    // Apply specialty filter
    if (specialty && specialty !== 'all') {
      query = query.eq('specialty', specialty);
    }

    // Order by vote count (descending) first, then by creation date for search queries
    if (search && search.trim()) {
      // For search queries, we'll sort by relevance and vote count
      query = query.order('votes', { ascending: false }).order('created_at', { ascending: false });
    } else {
      // For non-search queries, order by vote count first, then creation date
      query = query.order('votes', { ascending: false }).order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching prompts:', error);
      // Return mock data as fallback
      return fetchPrompts(options);
    }

    // Transform the data to include vote counts (use the votes field directly)
    const promptsWithVotes = data?.map(prompt => ({
      ...prompt,
      votes_count: prompt.votes || 0, // Use votes field directly
    })) || [];

    return promptsWithVotes as PromptWithUser[];
  } catch (error) {
    console.error('Error in fetchPrompts:', error);
    // Return mock data as fallback
    return fetchPrompts({ ...options });
  }
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
    
    // Sort by votes then by created_at
    filtered.sort((a, b) => {
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return filtered.map(prompt => {
      if (!prompt.created_by || prompt.is_anonymous) {
        return {
          ...prompt,
          user_profiles: undefined,
          votes_count: prompt.votes,
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
        },
        votes_count: prompt.votes,
      };
    });
  }

  try {
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
      .order('votes', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user prompts:', error);
      return [];
    }

    // Transform the data to include vote counts
    const promptsWithVotes = data?.map(prompt => ({
      ...prompt,
      votes_count: prompt.votes || 0,
    })) || [];

    return promptsWithVotes as PromptWithUser[];
  } catch (error) {
    console.error('Error in fetchPromptsByUser:', error);
    return [];
  }
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
        votes_count: prompt.votes,
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
      },
      votes_count: prompt.votes,
    };
  }

  try {
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
      return null;
    }

    // Transform the data to include vote count
    const promptWithVotes = {
      ...data,
      votes_count: data.votes || 0,
    };

    return promptWithVotes as PromptWithUser;
  } catch (error) {
    console.error('Error in fetchPromptById:', error);
    return null;
  }
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
      filtered = filtered.filter(prompt => {
        // Handle both short category IDs and full category names
        const promptCategory = prompt.category.toLowerCase();
        const searchCategory = category.toLowerCase();
        
        // Check if the category matches exactly or if it's a substring
        return promptCategory === searchCategory || 
               promptCategory.includes(searchCategory) ||
               searchCategory.includes(promptCategory);
      });
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

  try {
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
      // Use ilike for case-insensitive matching
      query = query.ilike('category', `%${category}%`);
    }

    if (specialty && specialty !== 'all') {
      query = query.eq('specialty', specialty);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error fetching prompts count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTotalPromptsCount:', error);
    return 0;
  }
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