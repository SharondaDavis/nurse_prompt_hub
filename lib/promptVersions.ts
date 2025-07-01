import { supabase } from './supabaseClient';
import { Database } from '@/types/database';
import { mockPrompts } from './mockData';

type PromptVersion = Database['public']['Tables']['prompt_versions']['Row'];

// Extended prompt version type with user profile information
export interface PromptVersionWithUser extends PromptVersion {
  username?: string;
  full_name?: string;
  user_specialty?: string;
}

export interface CreateVersionData {
  originalPromptId: string;
  title: string;
  content: string;
  category: string;
  specialty?: string;
  tags?: string[];
  changeSummary?: string;
}

// Create a new version of a prompt
export async function createPromptVersion(data: CreateVersionData): Promise<PromptVersionWithUser | null> {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock version creation for demo
    const originalPrompt = mockPrompts.find(p => p.id === data.originalPromptId);
    if (!originalPrompt) {
      throw new Error('Original prompt not found');
    }

    const mockVersion: PromptVersionWithUser = {
      id: `version-${Date.now()}`,
      original_prompt_id: data.originalPromptId,
      title: data.title,
      content: data.content,
      category: data.category,
      specialty: data.specialty || null,
      tags: data.tags || [],
      created_by: '550e8400-e29b-41d4-a716-446655440000', // Demo user ID
      created_at: new Date().toISOString(),
      is_published: false,
      version_number: 1,
      change_summary: data.changeSummary || null,
      username: 'demo_user',
      full_name: 'Demo User',
      user_specialty: 'General Practice',
    };

    return mockVersion;
  }

  try {
    // Use the create_prompt_version function
    const { data: versionId, error: functionError } = await supabase.rpc(
      'create_prompt_version',
      {
        p_original_prompt_id: data.originalPromptId,
        p_title: data.title,
        p_content: data.content,
        p_category: data.category,
        p_specialty: data.specialty || null,
        p_tags: data.tags || [],
        p_change_summary: data.changeSummary || null
      }
    );

    if (functionError) {
      console.error('Error creating prompt version:', functionError);
      throw functionError;
    }

    // Fetch the created version with user information
    const { data: version, error: fetchError } = await supabase
      .from('prompt_versions_with_users')
      .select('*')
      .eq('id', versionId)
      .single();

    if (fetchError) {
      console.error('Error fetching created version:', fetchError);
      throw fetchError;
    }

    return version as PromptVersionWithUser;
  } catch (error) {
    console.error('Error in createPromptVersion:', error);
    throw error;
  }
}

// Publish a prompt version
export async function publishPromptVersion(versionId: string): Promise<boolean> {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock publishing for demo
    return true;
  }

  try {
    const { data, error } = await supabase.rpc(
      'publish_prompt_version',
      { p_version_id: versionId }
    );

    if (error) {
      console.error('Error publishing prompt version:', error);
      throw error;
    }

    return data as boolean;
  } catch (error) {
    console.error('Error in publishPromptVersion:', error);
    throw error;
  }
}

// Get all versions of a prompt
export async function getPromptVersions(promptId: string): Promise<PromptVersionWithUser[]> {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock versions for demo
    const originalPrompt = mockPrompts.find(p => p.id === promptId);
    if (!originalPrompt) {
      return [];
    }

    // Create a few mock versions
    const mockVersions: PromptVersionWithUser[] = [
      {
        id: `version-1-${promptId}`,
        original_prompt_id: promptId,
        title: `${originalPrompt.title} - Updated`,
        content: `${originalPrompt.content}\n\nAdditional information added in this version.`,
        category: originalPrompt.category,
        specialty: originalPrompt.specialty,
        tags: [...(originalPrompt.tags || []), 'updated'],
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        is_published: true,
        version_number: 1,
        change_summary: 'Added more detailed instructions and clarified steps.',
        username: 'sarah_icu_rn',
        full_name: 'Sarah Johnson',
        user_specialty: 'ICU',
      },
      {
        id: `version-2-${promptId}`,
        original_prompt_id: promptId,
        title: `${originalPrompt.title} - Expanded`,
        content: `${originalPrompt.content}\n\nExpanded with additional scenarios and edge cases.`,
        category: originalPrompt.category,
        specialty: originalPrompt.specialty,
        tags: [...(originalPrompt.tags || []), 'expanded', 'comprehensive'],
        created_by: '550e8400-e29b-41d4-a716-446655440101',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        is_published: true,
        version_number: 2,
        change_summary: 'Expanded with additional scenarios and edge cases for more comprehensive coverage.',
        username: 'mike_medsurg',
        full_name: 'Michael Chen',
        user_specialty: 'Medical-Surgical',
      },
    ];

    return mockVersions;
  }

  try {
    const { data, error } = await supabase
      .from('prompt_versions_with_users')
      .select('*')
      .eq('original_prompt_id', promptId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching prompt versions:', error);
      throw error;
    }

    return data as PromptVersionWithUser[];
  } catch (error) {
    console.error('Error in getPromptVersions:', error);
    throw error;
  }
}

// Get a specific version of a prompt
export async function getPromptVersion(versionId: string): Promise<PromptVersionWithUser | null> {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock version for demo
    // This would normally be more sophisticated, checking against stored mock versions
    return {
      id: versionId,
      original_prompt_id: 'mock-prompt-id',
      title: 'Mock Version Title',
      content: 'This is a mock version of a prompt for demonstration purposes.',
      category: 'Code Blue Debrief',
      specialty: 'ICU',
      tags: ['mock', 'version', 'demo'],
      created_by: '550e8400-e29b-41d4-a716-446655440000',
      created_at: new Date().toISOString(),
      is_published: true,
      version_number: 1,
      change_summary: 'Mock version for demonstration.',
      username: 'demo_user',
      full_name: 'Demo User',
      user_specialty: 'General Practice',
    };
  }

  try {
    const { data, error } = await supabase
      .from('prompt_versions_with_users')
      .select('*')
      .eq('id', versionId)
      .single();

    if (error) {
      console.error('Error fetching prompt version:', error);
      throw error;
    }

    return data as PromptVersionWithUser;
  } catch (error) {
    console.error('Error in getPromptVersion:', error);
    throw error;
  }
}

// Delete a prompt version
export async function deletePromptVersion(versionId: string): Promise<boolean> {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock deletion for demo
    return true;
  }

  try {
    const { error } = await supabase
      .from('prompt_versions')
      .delete()
      .eq('id', versionId);

    if (error) {
      console.error('Error deleting prompt version:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePromptVersion:', error);
    throw error;
  }
}