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
          created_at: string
          email: string
          name: string | null
          role: 'admin' | 'student' | 'international_student'
          group_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          name?: string | null
          role?: 'admin' | 'student' | 'international_student'
          group_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          role?: 'admin' | 'student' | 'international_student'
          group_id?: string | null
        }
      }
      groups: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
        }
      }
      resources: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          url: string | null
          file_path: string | null
          type: 'document' | 'link' | 'video' | 'image'
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          url?: string | null
          file_path?: string | null
          type: 'document' | 'link' | 'video' | 'image'
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          url?: string | null
          file_path?: string | null
          type?: 'document' | 'link' | 'video' | 'image'
          user_id?: string
        }
      }
      works: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          user_id: string
          day: number
          status: 'draft' | 'submitted' | 'reviewed'
          feedback_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          user_id: string
          day: number
          status?: 'draft' | 'submitted' | 'reviewed'
          feedback_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          user_id?: string
          day?: number
          status?: 'draft' | 'submitted' | 'reviewed'
          feedback_id?: string | null
        }
      }
      feedback: {
        Row: {
          id: string
          created_at: string
          content: string
          work_id: string
          reviewer_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          work_id: string
          reviewer_id: string
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          work_id?: string
          reviewer_id?: string
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          content: string
          user_id: string
          group_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          user_id: string
          group_id: string
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          user_id?: string
          group_id?: string
        }
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
  }
} 