import { NextResponse } from 'next/server'
import supabase from '@/lib/supabaseClient'

export async function GET() {
  const callbackUrl = process.env.NEXT_PUBLIC_AUTH_CALLBACK_URL
  if (!callbackUrl) {
    return NextResponse.json(
      { error: 'Auth callback URL is not configured' },
      { status: 500 }
    )
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'twitter',
    options: {
      redirectTo: callbackUrl,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ url: data.url })
}