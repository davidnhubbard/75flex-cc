// Run `supabase gen types typescript --schema public > src/lib/database.types.ts` to regenerate.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type DayState = 'none' | 'partial' | 'complete'
export type ChallengeStatus = 'active' | 'archived' | 'complete'
export type ChallengeTemplate = '75_hard' | '75_soft' | 'custom'

export interface Database {
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    Tables: {
      challenges: {
        Row: {
          id: string
          user_id: string
          title: string
          template: ChallengeTemplate
          start_date: string
          end_date: string
          status: ChallengeStatus
          duration_days: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['challenges']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>
        Relationships: never[]
      }
      commitments: {
        Row: {
          id: string
          challenge_id: string
          category: string
          name: string
          definition: string | null
          sort_order: number
          active_from: number
          required: boolean
          target_value: number | null
          target_unit: 'oz' | 'ml' | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['commitments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['commitments']['Insert']>
        Relationships: never[]
      }
      commitment_history: {
        Row: {
          id: string
          commitment_id: string
          old_definition: string | null
          new_definition: string | null
          changed_on_day: number
          changed_at: string
        }
        Insert: Omit<Database['public']['Tables']['commitment_history']['Row'], 'id'>
        Update: never
        Relationships: never[]
      }
      daily_logs: {
        Row: {
          id: string
          challenge_id: string
          day_number: number
          log_date: string
          overall_state: DayState
          reflection: 'felt_good' | 'tough_but_done' | 'almost_quit' | null
          logged_at: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_logs']['Row'], 'id' | 'updated_at' | 'reflection' | 'logged_at'>
        Update: Partial<Omit<Database['public']['Tables']['daily_logs']['Row'], 'id' | 'updated_at'>>
        Relationships: never[]
      }
      commitment_logs: {
        Row: {
          id: string
          daily_log_id: string
          commitment_id: string
          state: DayState
          numeric_value: number | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          daily_log_id: string
          commitment_id: string
          state: DayState
          numeric_value?: number | null
          photo_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['commitment_logs']['Insert']>
        Relationships: never[]
      }
      benchmarks: {
        Row: {
          id: string
          challenge_id: string
          notes_text: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['benchmarks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['benchmarks']['Insert']>
        Relationships: never[]
      }
      day_notes: {
        Row: {
          id: string
          daily_log_id: string
          note_text: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['day_notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['day_notes']['Insert']>
        Relationships: never[]
      }
    }
  }
}
