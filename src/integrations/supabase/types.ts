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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          payload: Json | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          payload?: Json | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          payload?: Json | null
        }
        Relationships: []
      }
      agents: {
        Row: {
          active: boolean
          away_message: string | null
          business_hours: string | null
          created_at: string
          goals: string | null
          greeting: string | null
          id: string
          model: string | null
          name: string
          prompt: string | null
          rules: string | null
          tone: string | null
          transfer_message: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          away_message?: string | null
          business_hours?: string | null
          created_at?: string
          goals?: string | null
          greeting?: string | null
          id?: string
          model?: string | null
          name: string
          prompt?: string | null
          rules?: string | null
          tone?: string | null
          transfer_message?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          away_message?: string | null
          business_hours?: string | null
          created_at?: string
          goals?: string | null
          greeting?: string | null
          id?: string
          model?: string | null
          name?: string
          prompt?: string | null
          rules?: string | null
          tone?: string | null
          transfer_message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          function_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          is_public?: boolean
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          description?: string | null
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      automation_failures: {
        Row: {
          created_at: string
          error: string | null
          id: string
          payload: Json | null
          source: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json | null
          source: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json | null
          source?: string
        }
        Relationships: []
      }
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
      body_measurements: {
        Row: {
          arm_cm: number | null
          body_fat_pct: number | null
          chest_cm: number | null
          created_at: string
          hip_cm: number | null
          id: string
          measured_at: string
          notes: string | null
          photo_url: string | null
          thigh_cm: number | null
          user_id: string
          waist_cm: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          created_at?: string
          hip_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          photo_url?: string | null
          thigh_cm?: number | null
          user_id: string
          waist_cm?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          created_at?: string
          hip_cm?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          photo_url?: string | null
          thigh_cm?: number | null
          user_id?: string
          waist_cm?: number | null
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
      conversation_notes: {
        Row: {
          admin_id: string | null
          conversation_id: string
          created_at: string
          id: string
          note: string
        }
        Insert: {
          admin_id?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          note: string
        }
        Update: {
          admin_id?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to: string | null
          channel: string
          contact_name: string | null
          created_at: string
          handled_by: string
          id: string
          instance_id: string | null
          last_message_at: string | null
          phone: string
          status: string
          tags: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          channel?: string
          contact_name?: string | null
          created_at?: string
          handled_by?: string
          id?: string
          instance_id?: string | null
          last_message_at?: string | null
          phone: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          channel?: string
          contact_name?: string | null
          created_at?: string
          handled_by?: string
          id?: string
          instance_id?: string | null
          last_message_at?: string | null
          phone?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_instance_id_fkey"
            columns: ["instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
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
      entitlements: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string | null
          granted_at: string
          id: string
          notes: string | null
          source: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          source?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          id?: string
          notes?: string | null
          source?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_substitutions: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          priority: number
          reason: string | null
          substitute_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          priority?: number
          reason?: string | null
          substitute_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          priority?: number
          reason?: string | null
          substitute_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_substitutions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_substitutions_substitute_id_fkey"
            columns: ["substitute_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          cautions: string | null
          content_hash: string | null
          created_at: string
          difficulty: string | null
          environments: string[]
          equipment: string[]
          id: string
          instructions: string | null
          is_active: boolean
          laterality: string | null
          movement_pattern: string | null
          name: string
          original_filename: string | null
          primary_muscle: string | null
          review_status: Database["public"]["Enums"]["exercise_review_status"]
          secondary_muscles: string[]
          slug: string
          thumbnail_path: string | null
          updated_at: string
          video_path: string | null
        }
        Insert: {
          cautions?: string | null
          content_hash?: string | null
          created_at?: string
          difficulty?: string | null
          environments?: string[]
          equipment?: string[]
          id?: string
          instructions?: string | null
          is_active?: boolean
          laterality?: string | null
          movement_pattern?: string | null
          name: string
          original_filename?: string | null
          primary_muscle?: string | null
          review_status?: Database["public"]["Enums"]["exercise_review_status"]
          secondary_muscles?: string[]
          slug: string
          thumbnail_path?: string | null
          updated_at?: string
          video_path?: string | null
        }
        Update: {
          cautions?: string | null
          content_hash?: string | null
          created_at?: string
          difficulty?: string | null
          environments?: string[]
          equipment?: string[]
          id?: string
          instructions?: string | null
          is_active?: boolean
          laterality?: string | null
          movement_pattern?: string | null
          name?: string
          original_filename?: string | null
          primary_muscle?: string | null
          review_status?: Database["public"]["Enums"]["exercise_review_status"]
          secondary_muscles?: string[]
          slug?: string
          thumbnail_path?: string | null
          updated_at?: string
          video_path?: string | null
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
      habits_daily: {
        Row: {
          created_at: string
          day_completed: boolean
          energy: number | null
          entry_date: string
          id: string
          meals_ok: boolean
          notes: string | null
          sleep_end: string | null
          sleep_goal_hours: number | null
          sleep_hours: number | null
          sleep_quality: string | null
          sleep_start: string | null
          steps: number | null
          updated_at: string
          user_id: string
          water_goal_ml: number
          water_ml: number
          workout_done: boolean
        }
        Insert: {
          created_at?: string
          day_completed?: boolean
          energy?: number | null
          entry_date?: string
          id?: string
          meals_ok?: boolean
          notes?: string | null
          sleep_end?: string | null
          sleep_goal_hours?: number | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          sleep_start?: string | null
          steps?: number | null
          updated_at?: string
          user_id: string
          water_goal_ml?: number
          water_ml?: number
          workout_done?: boolean
        }
        Update: {
          created_at?: string
          day_completed?: boolean
          energy?: number | null
          entry_date?: string
          id?: string
          meals_ok?: boolean
          notes?: string | null
          sleep_end?: string | null
          sleep_goal_hours?: number | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          sleep_start?: string | null
          steps?: number | null
          updated_at?: string
          user_id?: string
          water_goal_ml?: number
          water_ml?: number
          workout_done?: boolean
        }
        Relationships: []
      }
      journey_days: {
        Row: {
          created_at: string
          day_num: number
          focus: string | null
          id: string
          journey_id: string
          notes: string | null
          task: string | null
          title: string | null
          workout_id: string | null
        }
        Insert: {
          created_at?: string
          day_num: number
          focus?: string | null
          id?: string
          journey_id: string
          notes?: string | null
          task?: string | null
          title?: string | null
          workout_id?: string | null
        }
        Update: {
          created_at?: string
          day_num?: number
          focus?: string | null
          id?: string
          journey_id?: string
          notes?: string | null
          task?: string | null
          title?: string | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_days_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          active: boolean
          cover_url: string | null
          created_at: string
          description: string | null
          goal: string | null
          id: string
          name: string
          order_num: number
          slug: string
          total_days: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          cover_url?: string | null
          created_at?: string
          description?: string | null
          goal?: string | null
          id?: string
          name: string
          order_num?: number
          slug: string
          total_days?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          cover_url?: string | null
          created_at?: string
          description?: string | null
          goal?: string | null
          id?: string
          name?: string
          order_num?: number
          slug?: string
          total_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          active: boolean
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          external_url: string | null
          file_path: string | null
          goals: string[] | null
          id: string
          item_type: string
          native_content: string | null
          order_num: number
          requires_access: boolean
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_path?: string | null
          goals?: string[] | null
          id?: string
          item_type?: string
          native_content?: string | null
          order_num?: number
          requires_access?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_path?: string | null
          goals?: string[] | null
          id?: string
          item_type?: string
          native_content?: string | null
          order_num?: number
          requires_access?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          direction: string
          external_id: string | null
          id: string
          media_url: string | null
          message_type: string
          sender: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          direction: string
          external_id?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          sender?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          direction?: string
          external_id?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          sender?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          checkout_url: string | null
          created_at: string
          description: string | null
          external_product_id: string | null
          highlight: boolean
          id: string
          name: string
          order_num: number
          period: string
          price_cents: number | null
          price_label: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          checkout_url?: string | null
          created_at?: string
          description?: string | null
          external_product_id?: string | null
          highlight?: boolean
          id?: string
          name: string
          order_num?: number
          period?: string
          price_cents?: number | null
          price_label?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          checkout_url?: string | null
          created_at?: string
          description?: string | null
          external_product_id?: string | null
          highlight?: boolean
          id?: string
          name?: string
          order_num?: number
          period?: string
          price_cents?: number | null
          price_label?: string | null
          updated_at?: string
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
          avatar_url: string | null
          created_at: string | null
          dietary_restrictions: string[] | null
          display_name: string | null
          equipment: string[] | null
          experience_level: string | null
          food_preferences: string[] | null
          goal: string | null
          height_cm: number | null
          id: string
          initial_weight_kg: number | null
          onboarding_completed: boolean | null
          phone: string | null
          physical_limitations: string | null
          session_minutes: number | null
          sleep_quality: string | null
          target_weight_kg: number | null
          tour_completed: boolean | null
          training_location: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          available_days?: number | null
          avatar_url?: string | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          equipment?: string[] | null
          experience_level?: string | null
          food_preferences?: string[] | null
          goal?: string | null
          height_cm?: number | null
          id: string
          initial_weight_kg?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          physical_limitations?: string | null
          session_minutes?: number | null
          sleep_quality?: string | null
          target_weight_kg?: number | null
          tour_completed?: boolean | null
          training_location?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          available_days?: number | null
          avatar_url?: string | null
          created_at?: string | null
          dietary_restrictions?: string[] | null
          display_name?: string | null
          equipment?: string[] | null
          experience_level?: string | null
          food_preferences?: string[] | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          initial_weight_kg?: number | null
          onboarding_completed?: boolean | null
          phone?: string | null
          physical_limitations?: string | null
          session_minutes?: number | null
          sleep_quality?: string | null
          target_weight_kg?: number | null
          tour_completed?: boolean | null
          training_location?: string | null
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
          active: boolean
          calories: number | null
          category: string | null
          created_at: string | null
          description: string | null
          diet_tags: string[] | null
          difficulty: string | null
          goals: string[] | null
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
          active?: boolean
          calories?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          diet_tags?: string[] | null
          difficulty?: string | null
          goals?: string[] | null
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
          active?: boolean
          calories?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          diet_tags?: string[] | null
          difficulty?: string | null
          goals?: string[] | null
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
      session_exercises: {
        Row: {
          block: string | null
          created_at: string
          duration_sec: number | null
          exercise_id: string
          id: string
          load_guidance: string | null
          notes: string | null
          order_num: number
          reps: string | null
          rest_sec: number | null
          session_id: string
          sets: number | null
          tempo: string | null
          updated_at: string
        }
        Insert: {
          block?: string | null
          created_at?: string
          duration_sec?: number | null
          exercise_id: string
          id?: string
          load_guidance?: string | null
          notes?: string | null
          order_num?: number
          reps?: string | null
          rest_sec?: number | null
          session_id: string
          sets?: number | null
          tempo?: string | null
          updated_at?: string
        }
        Update: {
          block?: string | null
          created_at?: string
          duration_sec?: number | null
          exercise_id?: string
          id?: string
          load_guidance?: string | null
          notes?: string | null
          order_num?: number
          reps?: string | null
          rest_sec?: number | null
          session_id?: string
          sets?: number | null
          tempo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_events: {
        Row: {
          created_at: string
          event_type: string
          external_event_id: string | null
          id: string
          payload: Json | null
          provider: string
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          external_event_id?: string | null
          id?: string
          payload?: Json | null
          provider?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          external_event_id?: string | null
          id?: string
          payload?: Json | null
          provider?: string
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          buyer_email: string | null
          buyer_phone: string | null
          created_at: string
          expires_at: string | null
          external_id: string | null
          id: string
          plan_id: string | null
          provider: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          buyer_email?: string | null
          buyer_phone?: string | null
          created_at?: string
          expires_at?: string | null
          external_id?: string | null
          id?: string
          plan_id?: string | null
          provider?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          buyer_email?: string | null
          buyer_phone?: string | null
          created_at?: string
          expires_at?: string | null
          external_id?: string | null
          id?: string
          plan_id?: string | null
          provider?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      training_programs: {
        Row: {
          cover_url: string | null
          created_at: string
          days_per_week: number | null
          description: string | null
          environment: string | null
          goal: string | null
          id: string
          is_active: boolean
          level: string | null
          name: string
          order_num: number
          review_status: Database["public"]["Enums"]["exercise_review_status"]
          slug: string
          updated_at: string
          weeks: number
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          environment?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean
          level?: string | null
          name: string
          order_num?: number
          review_status?: Database["public"]["Enums"]["exercise_review_status"]
          slug: string
          updated_at?: string
          weeks?: number
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          days_per_week?: number | null
          description?: string | null
          environment?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean
          level?: string | null
          name?: string
          order_num?: number
          review_status?: Database["public"]["Enums"]["exercise_review_status"]
          slug?: string
          updated_at?: string
          weeks?: number
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          created_at: string
          day_num: number
          duration_min: number | null
          focus: string | null
          id: string
          is_active: boolean
          notes: string | null
          order_num: number
          program_id: string
          title: string
          updated_at: string
          week_num: number
        }
        Insert: {
          created_at?: string
          day_num?: number
          duration_min?: number | null
          focus?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          order_num?: number
          program_id: string
          title: string
          updated_at?: string
          week_num?: number
        }
        Update: {
          created_at?: string
          day_num?: number
          duration_min?: number | null
          focus?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          order_num?: number
          program_id?: string
          title?: string
          updated_at?: string
          week_num?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
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
      whatsapp_instances: {
        Row: {
          active: boolean
          base_url: string | null
          connected_at: string | null
          created_at: string
          id: string
          instance_name: string | null
          label: string
          provider: string
          qr_code: string | null
          status: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          active?: boolean
          base_url?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_name?: string | null
          label: string
          provider?: string
          qr_code?: string | null
          status?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          active?: boolean
          base_url?: string | null
          connected_at?: string | null
          created_at?: string
          id?: string
          instance_name?: string | null
          label?: string
          provider?: string
          qr_code?: string | null
          status?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      workouts: {
        Row: {
          active: boolean
          created_at: string | null
          description: string | null
          duration_min: number | null
          equipment: string[] | null
          goal: string | null
          id: string
          instructions: string | null
          level: string | null
          location: string | null
          seq: number | null
          title: string
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          duration_min?: number | null
          equipment?: string[] | null
          goal?: string | null
          id?: string
          instructions?: string | null
          level?: string | null
          location?: string | null
          seq?: number | null
          title: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string | null
          description?: string | null
          duration_min?: number | null
          equipment?: string[] | null
          goal?: string | null
          id?: string
          instructions?: string | null
          level?: string | null
          location?: string | null
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
      check_ai_limit: { Args: { _user_id: string }; Returns: boolean }
      has_active_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      exercise_review_status: "pending_review" | "published" | "archived"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      exercise_review_status: ["pending_review", "published", "archived"],
    },
  },
} as const
