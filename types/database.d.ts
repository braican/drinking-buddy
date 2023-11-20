export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          name: string | null
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
          name?: string | null
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
          name?: string | null
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
          }
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
          }
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
          city: string | null
          country: string | null
          id: number
          lat: number | null
          lng: number | null
          name: string | null
          slug: string | null
          state: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          id?: number
          lat?: number | null
          lng?: number | null
          name?: string | null
          slug?: string | null
          state?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          id?: number
          lat?: number | null
          lng?: number | null
          name?: string | null
          slug?: string | null
          state?: string | null
        }
        Relationships: []
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
