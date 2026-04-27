import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getActiveChallenge } from '@/lib/queries'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code        = searchParams.get('code')
  const error       = searchParams.get('error')
  const errorDesc   = searchParams.get('error_description')

  if (error) {
    const msg = errorDesc ?? error
    console.error('[auth/callback] OAuth error:', error, errorDesc)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(msg)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('[auth/callback] exchangeCodeForSession failed:', exchangeError.message)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    const challenge = await getActiveChallenge(supabase as any)
    return NextResponse.redirect(`${origin}${challenge ? '/today' : '/onboarding'}`)
  }

  console.error('[auth/callback] No code or error in callback params')
  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Sign-in was cancelled or timed out')}`)
}
