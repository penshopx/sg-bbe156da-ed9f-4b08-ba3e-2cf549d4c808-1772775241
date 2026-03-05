/* eslint-disable @typescript-eslint/no-empty-object-type */
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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      breakout_assignments: {
        Row: {
          created_at: string | null
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "breakout_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "breakout_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      breakout_rooms: {
        Row: {
          created_at: string | null
          id: string
          meeting_id: string
          room_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          meeting_id: string
          room_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          meeting_id?: string
          room_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "breakout_rooms_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_users: {
        Row: {
          created_at: string | null
          display_name: string
          guest_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          guest_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          guest_id?: string
          id?: string
        }
        Relationships: []
      }
      meeting_chat: {
        Row: {
          created_at: string | null
          id: string
          meeting_id: string | null
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meeting_id?: string | null
          message?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_chat_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          display_name: string
          hand_raised: boolean | null
          id: string
          is_camera_on: boolean | null
          is_mic_on: boolean | null
          is_screen_sharing: boolean | null
          joined_at: string | null
          left_at: string | null
          meeting_id: string | null
          user_id: string | null
        }
        Insert: {
          display_name: string
          hand_raised?: boolean | null
          id?: string
          is_camera_on?: boolean | null
          is_mic_on?: boolean | null
          is_screen_sharing?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          meeting_id?: string | null
          user_id?: string | null
        }
        Update: {
          display_name?: string
          hand_raised?: boolean | null
          id?: string
          is_camera_on?: boolean | null
          is_mic_on?: boolean | null
          is_screen_sharing?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          meeting_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_polls: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          meeting_id: string
          options: Json
          question: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          meeting_id: string
          options?: Json
          question: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          meeting_id?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_polls_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_questions: {
        Row: {
          answer: string | null
          created_at: string | null
          id: string
          is_answered: boolean | null
          meeting_id: string
          question: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          meeting_id: string
          question: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string
          is_answered?: boolean | null
          meeting_id?: string
          question?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_questions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string | null
          ended_at: string | null
          host_id: string | null
          id: string
          is_active: boolean | null
          is_locked: boolean | null
          meeting_code: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          host_id?: string | null
          id?: string
          is_active?: boolean | null
          is_locked?: boolean | null
          meeting_code: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          host_id?: string | null
          id?: string
          is_active?: boolean | null
          is_locked?: boolean | null
          meeting_code?: string
          title?: string | null
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "meeting_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      webrtc_signals: {
        Row: {
          created_at: string | null
          from_user_id: string | null
          id: string
          meeting_id: string | null
          signal_data: Json
          signal_type: string
          to_user_id: string | null
        }
        Insert: {
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          meeting_id?: string | null
          signal_data: Json
          signal_type: string
          to_user_id?: string | null
        }
        Update: {
          created_at?: string | null
          from_user_id?: string | null
          id?: string
          meeting_id?: string | null
          signal_data?: Json
          signal_type?: string
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webrtc_signals_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
