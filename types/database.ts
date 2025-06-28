export interface Database {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: 'Code Blue Debrief' | 'Burnout Self-Check' | 'Shift Report Prep' | 'Prioritization Support' | 'Care Plan Helper' | 'Self-Care';
          tags: string[];
          created_by: string | null; // Allow null for built-in prompts
          created_at: string;
          updated_at: string;
          specialty: string | null; // Allow null for specialty
          difficulty_level: 'beginner' | 'intermediate' | 'advanced';
          votes: number;
          is_anonymous: boolean; // New field for anonymous posting
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category: 'Code Blue Debrief' | 'Burnout Self-Check' | 'Shift Report Prep' | 'Prioritization Support' | 'Care Plan Helper' | 'Self-Care';
          tags?: string[];
          created_by?: string | null; // Allow null for built-in prompts
          created_at?: string;
          updated_at?: string;
          specialty: string | null; // Allow null for specialty
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
          votes?: number;
          is_anonymous?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: 'Code Blue Debrief' | 'Burnout Self-Check' | 'Shift Report Prep' | 'Prioritization Support' | 'Care Plan Helper' | 'Self-Care';
          tags?: string[];
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          specialty?: string | null; // Allow null for specialty
          difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
          votes?: number;
          is_anonymous?: boolean;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          specialty: string;
          years_experience: number;
          bio: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          specialty: string;
          years_experience: number;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          specialty?: string;
          years_experience?: number;
          bio?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}