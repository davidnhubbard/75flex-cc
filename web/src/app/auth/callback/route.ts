import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getActiveChallenge } from '@/lib/queries'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    const challenge = await getActiveChallenge(supabase as any)
    return NextResponse.redirect(`${origin}${challenge ? '/today' : '/onboarding'}`)
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
