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
    PostgrestVersion: "11.2.2 (f884da7)"
  }
  public: {
    Tables: {
      beers: {
        Row: {
          abv: number | null
          average: number | null
          brewery: number | null
          hads: number | null
          id: number
          label: string | null
          last_had: string | null
          name: string | null
          rated_hads: number | null
          slug: string | null
          style: string | null
          total_rating: number | null
        }
        Insert: {
          abv?: number | null
          average?: number | null
          brewery?: number | null
          hads?: number | null
          id?: number
          label?: string | null
          last_had?: string | null
          name?: string | null
          rated_hads?: number | null
          slug?: string | null
          style?: string | null
          total_rating?: number | null
        }
        Update: {
          abv?: number | null
          average?: number | null
          brewery?: number | null
          hads?: number | null
          id?: number
          label?: string | null
          last_had?: string | null
          name?: string | null
          rated_hads?: number | null
          slug?: string | null
          style?: string | null
          total_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beers_brewery_fkey"
            columns: ["brewery"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
        ]
      }
      breweries: {
        Row: {
          average: number | null
          city: string | null
          country: string | null
          hads: number | null
          id: number
          label: string | null
          lat: number | null
          lng: number | null
          name: string | null
          rated_hads: number | null
          slug: string | null
          state: string | null
          total_rating: number | null
          type: string | null
        }
        Insert: {
          average?: number | null
          city?: string | null
          country?: string | null
          hads?: number | null
          id?: number
          label?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          rated_hads?: number | null
          slug?: string | null
          state?: string | null
          total_rating?: number | null
          type?: string | null
        }
        Update: {
          average?: number | null
          city?: string | null
          country?: string | null
          hads?: number | null
          id?: number
          label?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          rated_hads?: number | null
          slug?: string | null
          state?: string | null
          total_rating?: number | null
          type?: string | null
        }
        Relationships: []
      }
      checkins: {
        Row: {
          beer: number | null
          brewery: number | null
          comment: string | null
          created_at: string
          id: number
          rating: number | null
          venue: number | null
        }
        Insert: {
          beer?: number | null
          brewery?: number | null
          comment?: string | null
          created_at?: string
          id?: number
          rating?: number | null
          venue?: number | null
        }
        Update: {
          beer?: number | null
          brewery?: number | null
          comment?: string | null
          created_at?: string
          id?: number
          rating?: number | null
          venue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_beer_fkey"
            columns: ["beer"]
            isOneToOne: false
            referencedRelation: "beers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_brewery_fkey"
            columns: ["brewery"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_venue_fkey"
            columns: ["venue"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          badges: number | null
          beers: number | null
          checkins: number | null
          firstname: string | null
          id: number
          last_updated: string | null
          lastname: string | null
          username: string | null
        }
        Insert: {
          avatar?: string | null
          badges?: number | null
          beers?: number | null
          checkins?: number | null
          firstname?: string | null
          id?: number
          last_updated?: string | null
          lastname?: string | null
          username?: string | null
        }
        Update: {
          avatar?: string | null
          badges?: number | null
          beers?: number | null
          checkins?: number | null
          firstname?: string | null
          id?: number
          last_updated?: string | null
          lastname?: string | null
          username?: string | null
        }
        Relationships: []
      }
      venues: {
        Row: {
          address: string | null
          average: number | null
          city: string | null
          country: string | null
          hads: number | null
          id: number
          lat: number | null
          lng: number | null
          name: string | null
          rated_hads: number | null
          slug: string | null
          state: string | null
          total_rating: number | null
        }
        Insert: {
          address?: string | null
          average?: number | null
          city?: string | null
          country?: string | null
          hads?: number | null
          id?: number
          lat?: number | null
          lng?: number | null
          name?: string | null
          rated_hads?: number | null
          slug?: string | null
          state?: string | null
          total_rating?: number | null
        }
        Update: {
          address?: string | null
          average?: number | null
          city?: string | null
          country?: string | null
          hads?: number | null
          id?: number
          lat?: number | null
          lng?: number | null
          name?: string | null
          rated_hads?: number | null
          slug?: string | null
          state?: string | null
          total_rating?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_beers_and_breweries: {
        Args: { query_text: string }
        Returns: {
          beer_name: string
          brewery_name: string
          slug: string
          table_name: string
        }[]
      }
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
