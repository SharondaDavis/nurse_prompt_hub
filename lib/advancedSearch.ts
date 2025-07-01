import { supabase } from './supabaseClient';
import { mockPrompts } from './mockData';
import { PromptWithUser } from './fetchPrompts';

export interface SearchOptions {
  query?: string;
  categories?: string[];
  specialties?: string[];
  tags?: string[];
  createdBy?: string;
  hasVersions?: boolean;
  sortBy?: 'relevance' | 'date' | 'votes' | 'popularity';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  prompts: PromptWithUser[];
  total: number;
  hasMore: boolean;
}

// Parse advanced search operators from a query string
function parseSearchQuery(query: string): {
  textSearch: string;
  tags: string[];
  categories: string[];
  specialties: string[];
} {
  const result = {
    textSearch: '',
    tags: [] as string[],
    categories: [] as string[],
    specialties: [] as string[],
  };

  // Extract tag:value pairs
  const tagRegex = /tag:([^\s]+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(query)) !== null) {
    result.tags.push(tagMatch[1].toLowerCase());
  }

  // Extract category:value pairs
  const categoryRegex = /category:([^\s]+)/g;
  let categoryMatch;
  while ((categoryMatch = categoryRegex.exec(query)) !== null) {
    result.categories.push(categoryMatch[1].toLowerCase());
  }

  // Extract specialty:value pairs
  const specialtyRegex = /specialty:([^\s]+)/g;
  let specialtyMatch;
  while ((specialtyMatch = specialtyRegex.exec(query)) !== null) {
    result.specialties.push(specialtyMatch[1].toLowerCase());
  }

  // Remove all operators from the query for text search
  result.textSearch = query
    .replace(/tag:[^\s]+/g, '')
    .replace(/category:[^\s]+/g, '')
    .replace(/specialty:[^\s]+/g, '')
    .trim();

  return result;
}

// Advanced search function
export async function advancedSearch(options: SearchOptions): Promise<SearchResult> {
  const {
    query = '',
    categories = [],
    specialties = [],
    tags = [],
    createdBy,
    hasVersions,
    sortBy = 'relevance',
    sortDirection = 'desc',
    limit = 20,
    offset = 0,
  } = options;

  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  // Parse advanced search operators if query is provided
  const parsedQuery = query ? parseSearchQuery(query) : {
    textSearch: '',
    tags: [],
    categories: [],
    specialties: [],
  };

  // Combine parsed operators with explicit filters
  const allTags = [...tags, ...parsedQuery.tags];
  const allCategories = [...categories, ...parsedQuery.categories];
  const allSpecialties = [...specialties, ...parsedQuery.specialties];

  if (!isSupabaseConfigured) {
    // Mock search for demo
    let filtered = [...mockPrompts];

    // Filter by text search
    if (parsedQuery.textSearch) {
      const searchTerms = parsedQuery.textSearch.toLowerCase().split(' ');
      filtered = filtered.filter(prompt => {
        const content = (prompt.title + ' ' + prompt.content).toLowerCase();
        return searchTerms.every(term => content.includes(term));
      });
    }

    // Filter by categories
    if (allCategories.length > 0) {
      filtered = filtered.filter(prompt => 
        allCategories.some(cat => 
          prompt.category.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }

    // Filter by specialties
    if (allSpecialties.length > 0) {
      filtered = filtered.filter(prompt => 
        prompt.specialty && allSpecialties.some(spec => 
          prompt.specialty!.toLowerCase().includes(spec.toLowerCase())
        )
      );
    }

    // Filter by tags
    if (allTags.length > 0) {
      filtered = filtered.filter(prompt => 
        prompt.tags && allTags.some(tag => 
          prompt.tags.some(promptTag => 
            promptTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Filter by creator
    if (createdBy) {
      filtered = filtered.filter(prompt => prompt.created_by === createdBy);
    }

    // Sort results
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        });
        break;
      case 'votes':
        filtered.sort((a, b) => {
          return sortDirection === 'desc' ? b.votes - a.votes : a.votes - b.votes;
        });
        break;
      case 'popularity':
        // For mock data, we'll use votes as a proxy for popularity
        filtered.sort((a, b) => {
          return sortDirection === 'desc' ? b.votes - a.votes : a.votes - b.votes;
        });
        break;
      case 'relevance':
      default:
        // For mock data with text search, we'll use a simple relevance score
        if (parsedQuery.textSearch) {
          const searchTerms = parsedQuery.textSearch.toLowerCase().split(' ');
          filtered.sort((a, b) => {
            const contentA = (a.title + ' ' + a.content).toLowerCase();
            const contentB = (b.title + ' ' + b.content).toLowerCase();
            
            const scoreA = searchTerms.reduce((score, term) => {
              return score + (contentA.includes(term) ? 1 : 0);
            }, 0);
            
            const scoreB = searchTerms.reduce((score, term) => {
              return score + (contentB.includes(term) ? 1 : 0);
            }, 0);
            
            return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
          });
        } else {
          // Default to sorting by votes if no search terms
          filtered.sort((a, b) => {
            return sortDirection === 'desc' ? b.votes - a.votes : a.votes - b.votes;
          });
        }
        break;
    }

    // Apply pagination
    const total = filtered.length;
    const paginatedResults = filtered.slice(offset, offset + limit);

    // Transform to PromptWithUser format
    const promptsWithUser: PromptWithUser[] = paginatedResults.map(prompt => ({
      ...prompt,
      user_profiles: prompt.created_by ? {
        username: 'demo_user',
        full_name: 'Demo User',
        specialty: 'General Practice'
      } : undefined,
      votes_count: prompt.votes
    }));

    return {
      prompts: promptsWithUser,
      total,
      hasMore: offset + limit < total
    };
  }

  try {
    // Start building the query
    let query = supabase
      .from('prompts')
      .select(`
        *,
        user_profiles (
          username,
          full_name,
          specialty
        )
      `, { count: 'exact' });

    // Apply text search if provided
    if (parsedQuery.textSearch) {
      query = query.textSearch('prompt_vector', parsedQuery.textSearch, {
        type: 'websearch',
        config: 'english'
      });
    }

    // Apply category filters
    if (allCategories.length > 0) {
      // Use OR condition for multiple categories
      const categoryFilter = allCategories.map(cat => `category.ilike.%${cat}%`).join(',');
      query = query.or(categoryFilter);
    }

    // Apply specialty filters
    if (allSpecialties.length > 0) {
      // Use OR condition for multiple specialties
      const specialtyFilter = allSpecialties.map(spec => `specialty.ilike.%${spec}%`).join(',');
      query = query.or(specialtyFilter);
    }

    // Apply tag filters
    if (allTags.length > 0) {
      // For each tag, check if it's in the tags array
      allTags.forEach(tag => {
        query = query.contains('tags', [tag]);
      });
    }

    // Filter by creator if provided
    if (createdBy) {
      query = query.eq('created_by', createdBy);
    }

    // Filter by has_versions if provided
    if (hasVersions !== undefined) {
      query = query.eq('has_versions', hasVersions);
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        query = query.order('created_at', { ascending: sortDirection === 'asc' });
        break;
      case 'votes':
        query = query.order('votes', { ascending: sortDirection === 'asc' });
        break;
      case 'popularity':
        // For popularity, we'll use a combination of votes and recency
        query = query.order('votes', { ascending: sortDirection === 'asc' })
                     .order('created_at', { ascending: sortDirection === 'asc' });
        break;
      case 'relevance':
      default:
        // For relevance with text search, rely on PostgreSQL's ranking
        if (parsedQuery.textSearch) {
          // No explicit ordering needed as textSearch applies ranking
        } else {
          // Default to sorting by votes if no search terms
          query = query.order('votes', { ascending: sortDirection === 'asc' });
        }
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }

    // Transform the data to include vote counts
    const promptsWithVotes = data?.map(prompt => ({
      ...prompt,
      votes_count: prompt.votes || 0,
    })) || [];

    return {
      prompts: promptsWithVotes as PromptWithUser[],
      total: count || 0,
      hasMore: count ? offset + limit < count : false
    };
  } catch (error) {
    console.error('Error in advancedSearch:', error);
    throw error;
  }
}

// Get search suggestions based on partial input
export async function getSearchSuggestions(partialQuery: string): Promise<string[]> {
  if (!partialQuery || partialQuery.length < 2) {
    return [];
  }

  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock suggestions for demo
    const mockSuggestions = [
      'code blue',
      'handoff',
      'burnout',
      'self-care',
      'documentation',
      'prioritization',
      'medication administration',
      'patient education',
      'time management',
      'stress reduction'
    ];

    return mockSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(partialQuery.toLowerCase())
    ).slice(0, 5);
  }

  try {
    // Get suggestions from titles, categories, and tags
    const { data: titleSuggestions, error: titleError } = await supabase
      .from('prompts')
      .select('title')
      .ilike('title', `%${partialQuery}%`)
      .limit(3);

    const { data: categorySuggestions, error: categoryError } = await supabase
      .from('prompts')
      .select('category')
      .ilike('category', `%${partialQuery}%`)
      .limit(3);

    const { data: tagSuggestions, error: tagError } = await supabase
      .rpc('search_tags', { search_term: partialQuery })
      .limit(3);

    if (titleError || categoryError || tagError) {
      console.error('Error getting search suggestions:', titleError || categoryError || tagError);
      return [];
    }

    // Combine and deduplicate suggestions
    const titles = titleSuggestions?.map(item => item.title) || [];
    const categories = categorySuggestions?.map(item => item.category) || [];
    const tags = tagSuggestions || [];

    const allSuggestions = [...titles, ...categories, ...tags];
    const uniqueSuggestions = [...new Set(allSuggestions)];

    return uniqueSuggestions.slice(0, 5);
  } catch (error) {
    console.error('Error in getSearchSuggestions:', error);
    return [];
  }
}

// Get related prompts based on a prompt's content, category, and tags
export async function getRelatedPrompts(promptId: string, limit: number = 3): Promise<PromptWithUser[]> {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock related prompts for demo
    const originalPrompt = mockPrompts.find(p => p.id === promptId);
    if (!originalPrompt) {
      return [];
    }

    // Find prompts with similar category or tags
    const relatedPrompts = mockPrompts
      .filter(p => p.id !== promptId) // Exclude the original prompt
      .filter(p => 
        p.category === originalPrompt.category || 
        p.specialty === originalPrompt.specialty ||
        (p.tags && originalPrompt.tags && 
          p.tags.some(tag => originalPrompt.tags.includes(tag)))
      )
      .slice(0, limit);

    // Transform to PromptWithUser format
    return relatedPrompts.map(prompt => ({
      ...prompt,
      user_profiles: prompt.created_by ? {
        username: 'demo_user',
        full_name: 'Demo User',
        specialty: 'General Practice'
      } : undefined,
      votes_count: prompt.votes
    }));
  }

  try {
    // First, get the original prompt to extract its category, specialty, and tags
    const { data: originalPrompt, error: promptError } = await supabase
      .from('prompts')
      .select('category, specialty, tags')
      .eq('id', promptId)
      .single();

    if (promptError) {
      console.error('Error fetching original prompt:', promptError);
      throw promptError;
    }

    // Build a query to find related prompts
    let query = supabase
      .from('prompts')
      .select(`
        *,
        user_profiles (
          username,
          full_name,
          specialty
        )
      `)
      .neq('id', promptId) // Exclude the original prompt
      .limit(limit);

    // Add filters based on the original prompt's attributes
    if (originalPrompt.category) {
      query = query.eq('category', originalPrompt.category);
    }

    if (originalPrompt.specialty) {
      query = query.eq('specialty', originalPrompt.specialty);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching related prompts:', error);
      throw error;
    }

    // If we don't have enough results, try a broader search with tags
    if (data.length < limit && originalPrompt.tags && originalPrompt.tags.length > 0) {
      const { data: tagRelatedPrompts, error: tagError } = await supabase
        .from('prompts')
        .select(`
          *,
          user_profiles (
            username,
            full_name,
            specialty
          )
        `)
        .neq('id', promptId)
        .contains('tags', originalPrompt.tags)
        .limit(limit - data.length);

      if (!tagError && tagRelatedPrompts) {
        // Combine results, ensuring no duplicates
        const existingIds = new Set(data.map(p => p.id));
        const uniqueTagPrompts = tagRelatedPrompts.filter(p => !existingIds.has(p.id));
        data.push(...uniqueTagPrompts);
      }
    }

    // Transform the data to include vote counts
    const promptsWithVotes = data?.map(prompt => ({
      ...prompt,
      votes_count: prompt.votes || 0,
    })) || [];

    return promptsWithVotes as PromptWithUser[];
  } catch (error) {
    console.error('Error in getRelatedPrompts:', error);
    throw error;
  }
}