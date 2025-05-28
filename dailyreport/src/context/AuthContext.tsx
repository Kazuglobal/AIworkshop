'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type UserRole = 'student' | 'international_student' | 'admin' | 'school';

type UserDetails = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  group_id: string | null;
  school_id: string | null;
};

type AuthContextType = {
  user: User | null;
  userDetails: UserDetails | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isStudent: boolean;
  isInternationalStudent: boolean;
  isSchool: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // セッション状態を取得
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setSession(session);
          setUser(session.user);
          await fetchUserDetails(session.user.id);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // セッション変更をサブスクライブ
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserDetails(session.user.id);
        } else {
          setUserDetails(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ユーザー詳細情報を取得
  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUserDetails({
          id: data.id,
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          role: data.role,
          group_id: data.group_id,
          school_id: data.school_id,
        });
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  // メール・パスワードでサインイン
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // サインアップ（新規登録）
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // ユーザーを新規登録
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (user) {
        // ユーザー詳細情報をusersテーブルに挿入
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: email,
              name: name,
              role: 'student', // デフォルトロール（必要に応じて変更）
            },
          ]);

        if (profileError) {
          throw profileError;
        }

        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Googleでサインイン
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // サインアウト
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // ユーザーロールのチェック
  const isAdmin = userDetails?.role === 'admin';
  const isStudent = userDetails?.role === 'student';
  const isInternationalStudent = userDetails?.role === 'international_student';
  const isSchool = userDetails?.role === 'school';

  return (
    <AuthContext.Provider
      value={{
        user,
        userDetails,
        session,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        isAdmin,
        isStudent,
        isInternationalStudent,
        isSchool,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 認証状態の確認用Higher Order Component
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const WithAuth: React.FC<P> = (props) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/auth/login');
      }
    }, [isLoading, user, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };

  return WithAuth;
} 