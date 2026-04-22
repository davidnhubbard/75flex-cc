'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Btn from '@/components/ui/Btn'
import Input from '@/components/ui/Input'
import Eyebrow from '@/components/ui/Eyebrow'

interface Props {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: Props) {
  const router   = useRouter()
  const supabase = createClient()

  const [email,       setEmail]      = useState('')
  const [password,    setPassword]   = useState('')
  const [error,       setError]      = useState<string | null>(null)
  const [loading,     setLoading]    = useState(false)
  const [checkEmail,  setCheckEmail] = useState(false)

  async function handleGoogle() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false) }
    // On success the browser redirects — no need to do anything else
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false) }
      else        { router.push('/today'); router.refresh() }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else if (data.session) {
        // Email confirmation disabled — session granted immediately
        router.push('/onboarding')
        router.refresh()
      } else {
        // Email confirmation required — tell user to check their inbox
        setCheckEmail(true)
        setLoading(false)
      }
    }
  }

  const isLogin = mode === 'login'

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto px-6 justify-center">
        <div className="w-12 h-12 rounded-full bg-green-800 flex items-center justify-center mb-6">
          <span className="text-2xl">📬</span>
        </div>
        <h1 className="font-display text-[28px] font-semibold tracking-tight text-surface leading-tight mb-2">
          Check your email.
        </h1>
        <p className="font-sans text-sm text-green-300 leading-relaxed mb-8">
          We sent a confirmation link to <span className="text-surface">{email}</span>. Click it to activate your account, then come back and sign in.
        </p>
        <Btn variant="outline" onClick={() => { setCheckEmail(false) }}>
          Back to sign in
        </Btn>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto px-6">
      {/* Logo */}
      <div className="pt-14 pb-8 flex items-center gap-2">
        <Image src="/brand/75flex-logo-heart.png" alt="75 Flex" width={28} height={28} />
        <Eyebrow color="green" className="text-[10px]">75 Flex</Eyebrow>
      </div>

      {/* Heading */}
      <h1 className="font-display text-[28px] font-semibold tracking-tight text-surface leading-tight mb-1">
        {isLogin ? 'Welcome back.' : 'Create your account.'}
      </h1>
      <p className="font-sans text-sm text-green-300 mb-8">
        {isLogin ? 'Sign in to continue your challenge.' : 'Start your 75-day journey.'}
      </p>

      {/* Google — white surface so the logo colours read correctly */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-surface text-ink font-sans text-sm font-semibold py-3.5 rounded-xl mb-5 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-green-700" />
        <Eyebrow color="green">or</Eyebrow>
        <div className="flex-1 h-px bg-green-700" />
      </div>

      {/* Email form */}
      <form onSubmit={handleEmail} className="flex flex-col gap-3">
        <Input
          variant="dark"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email address"
          required
          autoComplete="email"
        />
        <Input
          variant="dark"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          minLength={6}
        />

        {error && (
          <p className="font-sans text-xs text-amber px-1">{error}</p>
        )}

        <Btn
          variant="primary"
          type="submit"
          disabled={loading}
          className="mt-1"
        >
          {loading ? '...' : isLogin ? 'Sign in' : 'Create account'}
        </Btn>
      </form>

      {/* Toggle */}
      <p className="font-sans text-xs text-green-400 text-center mt-6">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <Link
          href={isLogin ? '/auth/signup' : '/auth/login'}
          className="text-ember underline"
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </Link>
      </p>
    </div>
  )
}
