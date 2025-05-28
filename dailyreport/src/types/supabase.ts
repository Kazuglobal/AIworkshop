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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          role: 'student' | 'international_student' | 'admin' | 'school' | null
          group_id: string | null
          school_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'international_student' | 'admin' | 'school' | null
          group_id?: string | null
          school_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'international_student' | 'admin' | 'school' | null
          group_id?: string | null
          school_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          description: string | null
          url: string | null
          file_path: string | null
          type: string
          created_by: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          url?: string | null
          file_path?: string | null
          type: string
          created_by: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          url?: string | null
          file_path?: string | null
          type?: string
          created_by?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      works: {
        Row: {
          id: string
          title: string
          description: string | null
          due_date: string | null
          user_id: string
          status: string
          feedback: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          due_date?: string | null
          user_id: string
          status: string
          feedback?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          user_id?: string
          status?: string
          feedback?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
} 