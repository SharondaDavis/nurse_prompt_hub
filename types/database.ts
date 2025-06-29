export interface Database {
  public: {
    Tables: {
      prompts: {
        Row: {
          id: string;
          title: string;
          prompt_text: string;
          content: string;
          category: string;
          specialty: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          votes: number;
          is_anonymous: boolean;
          prompt_vector: any;
        };
        Insert: {
          id?: string;
          title: string;
          prompt_text: string;
          content: string;
          category: string;
          specialty?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          votes?: number;
          is_anonymous?: boolean;
          prompt_vector?: any;
        };
        Update: {
          id?: string;
          title?: string;
          prompt_text?: string;
          content?: string;
          category?: string;
          specialty?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          votes?: number;
          is_anonymous?: boolean;
          prompt_vector?: any;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          specialty: string | null;
          years_experience: number | null;
          bio: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          specialty?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          specialty?: string | null;
          years_experience?: number | null;
          bio?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt_id?: string;
          created_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          username: string;
          avatar_url: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          username: string;
          avatar_url: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          username?: string;
          avatar_url?: string;
        };
      };
    };
    Views: {
      comments_with_users: {
        Row: {
          id: string | null;
          prompt_id: string | null;
          user_id: string | null;
          content: string | null;
          created_at: string | null;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          specialty: string | null;
        };
      };
    };
  };
}