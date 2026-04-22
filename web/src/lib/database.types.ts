// Run `supabase gen types typescript --schema public > src/lib/database.types.ts` to regenerate.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type DayState = 'none' | 'partial' | 'complete'
export type ChallengeStatus = 'active' | 'archived' | 'complete'
export type ChallengeTemplate = '75_hard' | '75_soft' | 'custom'

export interface Database {
  public: {
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
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['challenges']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['challenges']['Insert']>
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
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['commitments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['commitments']['Insert']>
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
      }
      daily_logs: {
        Row: {
          id: string
          challenge_id: string
          day_number: number
          log_date: string
          overall_state: DayState
          logged_at: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_logs']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['daily_logs']['Insert']>
      }
      commitment_logs: {
        Row: {
          id: string
          daily_log_id: string
          commitment_id: string
          state: DayState
          numeric_value: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['commitment_logs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['commitment_logs']['Insert']>
      }
      benchmarks: {
        Row: {
          id: string
          challenge_id: string
          notes_text: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['benchmarks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['benchmarks']['Insert']>
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
      }
    }
  }
}
