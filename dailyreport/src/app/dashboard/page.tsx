'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  const { user, userDetails, isLoading, isAdmin, isStudent, isInternationalStudent, isSchool } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <section className="p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800">
          {userDetails?.name || user.email}さん、こんにちは👋
        </h1>
        <p className="mt-2 text-gray-600">
          Culture Bridge Programへようこそ。あなたのロールは
          {isAdmin && <span className="font-medium text-blue-600"> 管理者 </span>}
          {isStudent && <span className="font-medium text-green-600"> 生徒 </span>}
          {isInternationalStudent && <span className="font-medium text-purple-600"> 留学生 </span>}
          {isSchool && <span className="font-medium text-orange-600"> 学校担当者 </span>}
          です。
        </p>
      </section>

      {/* ダッシュボードの内容はロールに応じて分岐 */}
      {isAdmin && <AdminDashboard />}
      {isStudent && <StudentDashboard />}
      {isInternationalStudent && <InternationalStudentDashboard />}
      {isSchool && <SchoolDashboard />}
    </div>
  )
}

// 管理者用ダッシュボード
function AdminDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard 
        title="ユーザー管理" 
        description="ユーザーの追加、編集、権限管理を行います。" 
        link="/admin/users" 
      />
      <DashboardCard 
        title="グループ管理" 
        description="グループの作成、編集、メンバー管理を行います。" 
        link="/admin/groups" 
      />
      <DashboardCard 
        title="進捗管理" 
        description="全体の進捗状況を確認します。" 
        link="/admin/progress" 
      />
      <DashboardCard 
        title="資料管理" 
        description="資料のアップロードや公開設定を行います。" 
        link="/admin/resources" 
      />
    </div>
  )
}

// 生徒用ダッシュボード
function StudentDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard 
        title="マイワーク" 
        description="あなたの提出したワークと進捗状況を確認します。" 
        link="/works/my" 
      />
      <DashboardCard 
        title="リソース検索" 
        description="学習に役立つリソースを検索・閲覧します。" 
        link="/resources" 
      />
      <DashboardCard 
        title="メッセージ" 
        description="担当留学生とのメッセージのやり取りを行います。" 
        link="/messages" 
      />
      <DashboardCard 
        title="スケジュール" 
        description="プログラムのスケジュールを確認します。" 
        link="/schedule" 
      />
    </div>
  )
}

// 留学生用ダッシュボード
function InternationalStudentDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard 
        title="担当生徒" 
        description="担当している生徒一覧と進捗状況を確認します。" 
        link="/students" 
      />
      <DashboardCard 
        title="ワーク管理" 
        description="生徒のワーク提出状況とフィードバックを管理します。" 
        link="/works/review" 
      />
      <DashboardCard 
        title="メッセージ" 
        description="担当生徒とのメッセージのやり取りを行います。" 
        link="/messages" 
      />
      <DashboardCard 
        title="自己紹介編集" 
        description="あなたのプロフィールと自己紹介を編集します。" 
        link="/profile" 
      />
    </div>
  )
}

// 学校担当者用ダッシュボード
function SchoolDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <DashboardCard 
        title="学校生徒一覧" 
        description="所属生徒の一覧と進捗状況を確認します。" 
        link="/school/students" 
      />
      <DashboardCard 
        title="進捗レポート" 
        description="生徒の進捗状況をレポート形式で確認します。" 
        link="/school/reports" 
      />
      <DashboardCard 
        title="資料ダウンロード" 
        description="学校向け資料をダウンロードします。" 
        link="/school/resources" 
      />
    </div>
  )
}

// 共通カードコンポーネント
function DashboardCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <a 
      href={link} 
      className="p-6 bg-white rounded-lg shadow transition-transform hover:translate-y-[-5px] hover:shadow-md"
    >
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <p className="mt-2 text-gray-600">{description}</p>
      <div className="mt-4 text-blue-600">詳細を見る &rarr;</div>
    </a>
  )
} 