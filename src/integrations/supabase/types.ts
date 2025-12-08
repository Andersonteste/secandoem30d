export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          order_num: number
          redirect_link: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          order_num?: number
          redirect_link: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          order_num?: number
          redirect_link?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bonus: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          ingredients: Json | null
          photo_url: string | null
          steps: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          ingredients?: Json | null
          photo_url?: string | null
          steps?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          ingredients?: Json | null
          photo_url?: string | null
          steps?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          day_num: number
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          day_num: number
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          day_num?: number
          user_id?: string
        }
        Relationships: []
      }
      clicks_afiliados: {
        Row: {
          clicked_at: string | null
          id: string
          produto_id: string
          referrer: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          produto_id: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          id?: string
          produto_id?: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clicks_afiliados_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos_loja"
            referencedColumns: ["id"]
          },
        ]
      }
      community_settings: {
        Row: {
          id: string
          link_grupo_vip: string
          updated_at: string
        }
        Insert: {
          id?: string
          link_grupo_vip?: string
          updated_at?: string
        }
        Update: {
          id?: string
          link_grupo_vip?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_meals: {
        Row: {
          created_at: string | null
          day_num: number | null
          id: string
          meals: Json | null
          task: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_num?: number | null
          id?: string
          meals?: Json | null
          task?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_num?: number | null
          id?: string
          meals?: Json | null
          task?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      food_diary: {
        Row: {
          created_at: string | null
          entry_date: string
          id: string
          notes: string | null
          photos: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_date: string
          id?: string
          notes?: string | null
          photos?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_date?: string
          id?: string
          notes?: string | null
          photos?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          created_at: string
          id: string
          post_id: string
          texto: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          texto: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          texto?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_comunidade"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts_comunidade"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_comunidade: {
        Row: {
          created_at: string
          id: string
          imagem_url: string | null
          texto: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          texto: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          imagem_url?: string | null
          texto?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      produtos_loja: {
        Row: {
          ativo: boolean | null
          categoria: string
          created_at: string | null
          descricao: string | null
          destaque: boolean | null
          id: string
          imagem_url: string | null
          link_afiliado: string
          nome: string
          ordem: number | null
          preco_exibicao: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_url?: string | null
          link_afiliado: string
          nome: string
          ordem?: number | null
          preco_exibicao?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_url?: string | null
          link_afiliado?: string
          nome?: string
          ordem?: number | null
          preco_exibicao?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          available_days: number | null
          created_at: string | null
          dietary_restrictions: string[] | null
          display_name: string | null
          experience_level: string | null
          goal: string | null
          height_cm: number | null
          id: string
          initial_weight_kg: number | null
          onboarding_completed: boolean | null
          target_weight_kg: number | null
          tour_completed: boolean | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          available_days?: number | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          experience_level?: string | null
          goal?: string | null
          height_cm?: number | null
          id: string
          initial_weight_kg?: number | null
          onboarding_completed?: boolean | null
          target_weight_kg?: number | null
          tour_completed?: boolean | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          available_days?: number | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          experience_level?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          initial_weight_kg?: number | null
          onboarding_completed?: boolean | null
          target_weight_kg?: number | null
          tour_completed?: boolean | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      receitas_geradas_ia: {
        Row: {
          created_at: string
          favorita: boolean | null
          id: string
          ingredientes_input: string
          receitas_geradas: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          favorita?: boolean | null
          id?: string
          ingredientes_input: string
          receitas_geradas: Json
          user_id: string
        }
        Update: {
          created_at?: string
          favorita?: boolean | null
          id?: string
          ingredientes_input?: string
          receitas_geradas?: Json
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          calories: number | null
          category: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          id: string
          ingredients: Json | null
          photo_url: string | null
          prep_time_min: number | null
          servings: number | null
          steps: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          calories?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          ingredients?: Json | null
          photo_url?: string | null
          prep_time_min?: number | null
          servings?: number | null
          steps?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          calories?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          ingredients?: Json | null
          photo_url?: string | null
          prep_time_min?: number | null
          servings?: number | null
          steps?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_favorite_recipes: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string
          id: string
          measured_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          measured_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          measured_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "weight_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string | null
          description: string | null
          duration_min: number | null
          id: string
          level: string | null
          seq: number | null
          title: string
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_min?: number | null
          id?: string
          level?: string | null
          seq?: number | null
          title: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_min?: number | null
          id?: string
          level?: string | null
          seq?: number | null
          title?: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
