import { supabase } from './supabaseClient';
import { Database } from '@/types/database';
import { mockPrompts } from './mockData';

type PromptInsert = Database['public']['Tables']['prompts']['Insert'];

export interface SubmitPromptData {
  title: string;
  content: string;
  category: string;
  specialty: string;
  tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  is_anonymous: boolean; // New field for anonymous posting
}

export async function submitPrompt(data: SubmitPromptData) {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock submission for demo purposes
    const newPrompt = {
      id: `550e8400-e29b-41d4-a716-${Date.now().toString().padStart(12, '0')}`,
      ...data,
      created_by: data.is_anonymous ? null : '550e8400-e29b-41d4-a716-446655440000', // Set to null if anonymous
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      votes: 0,
    };
    
    mockPrompts.unshift(newPrompt);
    return newPrompt;
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const promptData: PromptInsert = {
    ...data,
    created_by: data.is_anonymous ? null : user.id, // Set to null if anonymous
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    votes: 0,
  };

  const { data: insertedPrompt, error } = await supabase
    .from('prompts')
    .insert(promptData)
    .select()
    .single();

  if (error) {
    console.error('Error submitting prompt:', error);
    throw error;
  }

  return insertedPrompt;
}

export async function updatePrompt(id: string, updates: Partial<SubmitPromptData>) {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock update for demo purposes
    const promptIndex = mockPrompts.findIndex(p => p.id === id);
    if (promptIndex !== -1) {
      mockPrompts[promptIndex] = {
        ...mockPrompts[promptIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return mockPrompts[promptIndex];
    }
    throw new Error('Prompt not found');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('prompts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('created_by', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }

  return data;
}

export async function deletePrompt(id: string) {
  // Check if Supabase is properly configured
  const isSupabaseConfigured = 
    process.env.EXPO_PUBLIC_SUPABASE_URL && 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here';

  if (!isSupabaseConfigured) {
    // Mock deletion for demo purposes
    const promptIndex = mockPrompts.findIndex(p => p.id === id);
    if (promptIndex !== -1) {
      mockPrompts.splice(promptIndex, 1);
      return true;
    }
    throw new Error('Prompt not found');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('prompts')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id);

  if (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }

  return true;
}