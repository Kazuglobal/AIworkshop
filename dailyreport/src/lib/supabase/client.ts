'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// クライアントコンポーネント用のSupabaseクライアントを作成
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// サーバーサイド用のクライアントは別途必要に応じて作成 