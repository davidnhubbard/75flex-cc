import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code      = searchParams.get('code')
  const error     = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')

  if (error) {
    const msg = errorDesc ?? error
    console.error('[auth/callback] OAuth error:', error, errorDesc)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(msg)}`)
  }

  if (code) {
    // Create the redirect response FIRST so we can attach session cookies to it.
    // /today already redirects to /onboarding when there is no active challenge,
    // so we don't need to query the challenge here.
    const response = NextResponse.redirect(`${origin}/today`)

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Read cookies from the incoming request
          getAll() { return request.cookies.getAll() },
          // Write session cookies directly onto the outgoing redirect response
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
            )
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('[auth/callback] exchangeCodeForSession failed:', exchangeError.message)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(exchangeError.message)}`)
    }

    return response
  }

  console.error('[auth/callback] No code or error in callback params')
  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Sign-in was cancelled or timed out')}`)
}
