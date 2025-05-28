'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  
  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      
      try {
        // URLからのコードを処理
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.search.substring(6)
        );
        
        if (error) {
          throw error;
        }
        
        // 認証成功後にダッシュボードにリダイレクト
        router.push('/dashboard');
      } catch (error) {
        console.error('Error during auth callback:', error);
        // エラー時はログインページにリダイレクト
        router.push('/auth/login?error=callback_error');
      }
    };
    
    handleCallback();
  }, [router]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg">認証処理中...</p>
    </div>
  );
} 