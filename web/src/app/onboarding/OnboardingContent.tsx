'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { createChallenge, createCommitments, getActiveChallenge, todayISO } from '@/lib/queries'
import Btn from '@/components/ui/Btn'
import Eyebrow from '@/components/ui/Eyebrow'
import { CATEGORIES } from '@/lib/categories'

// ─── Types ───────────────────────────────────────────────────────────────────

type Template = '75_soft' | '75_hard'

interface Commitment {
  categoryId: string
  name: string
  definition: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    eyebrow: 'Welcome to 75 Flex',
    title: 'A Daily Physical and Mental Challenge. Your Way.',
    body: 'Commit to a set of daily habits for as long as you choose. Track your progress, reflect on your journey, and keep going even when life gets in the way.',
  },
  {
    eyebrow: 'How it works',
    title: 'You Define the Challenge.',
    body: 'Pick the commitments that matter to you — workouts, reading, diet, photos. Set your own standard for what "done" looks like each day.',
  },
  {
    eyebrow: 'Built for real life',
    title: 'Miss a Day? Keep Going.',
    body: 'This isn\'t about perfection. Your history is always preserved. Pick up where you left off — your progress doesn\'t disappear.',
  },
  {
    eyebrow: 'Ready?',
    title: 'Build Your Challenge.',
    body: 'Takes about 2 minutes. Your commitments aren\'t locked in — you can redefine, add, or remove them any time during your challenge.',
    cta: 'Build My Challenge',
  },
]

// ─── Step type ───────────────────────────────────────────────────────────────

type Step = 'slides' | 'plan-1' | 'plan-2' | 'plan-3'

// ─── Component ───────────────────────────────────────────────────────────────

export default function OnboardingContent() {
  const router   = useRouter()
  const supabase = createClient()

  // Guard: redirect to /today if user already has an active challenge
  useEffect(() => {
    getActiveChallenge(supabase).then(c => { if (c) router.replace('/today') })
  }, [])

  const [step, setStep]             = useState<Step>('slides')
  const [slideIndex, setSlide]      = useState(0)
  const [template, setTemplate]     = useState<Template>('75_soft')
  const [duration, setDuration]     = useState(75)
  const [customDuration, setCustomDuration] = useState('')
  const [showCustomDuration, setShowCustomDuration] = useState(false)
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [commitments, setCommits]   = useState<Record<string, Commitment>>({})
  const [hydrationGoal, setHydGoal] = useState('64')
  const [hydrationUnit, setHydUnit] = useState<'oz' | 'ml'>('oz')

  // ── Slides ──────────────────────────────────────────────────────────────

  function nextSlide() {
    if (slideIndex < SLIDES.length - 1) setSlide(i => i + 1)
    else setStep('plan-1')
  }

  function prevSlide() {
    if (slideIndex > 0) setSlide(i => i - 1)
  }

  // ── Category selection ──────────────────────────────────────────────────

  function toggleCategory(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        const c = { ...commitments }
        delete c[id]
        setCommits(c)
      } else {
        next.add(id)
        const cat = CATEGORIES.find(c => c.id === id)!
        setCommits(prev => ({
          ...prev,
          [id]: { categoryId: id, name: cat.defaultName, definition: cat.defaultDefinition },
        }))
      }
      return next
    })
  }

  // ── Commitment editing ──────────────────────────────────────────────────

  function updateCommitment(id: string, field: 'name' | 'definition', value: string) {
    setCommits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  // ── Finish ──────────────────────────────────────────────────────────────

  const [saving,      setSaving]      = useState(false)
  const [saveError,   setSaveError]   = useState<string | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  async function handleStart() {
    setSaving(true)
    setSaveError(null)
    try {
      const supabase = createClient()
      const challenge = await createChallenge(supabase, {
        title:        `${duration}-day challenge`,
        template,
        startDate:    todayISO(),
        durationDays: duration,
      })
      await createCommitments(supabase, challenge.id,
        selectedCategories.map((cat, i) => ({
          category:    cat.id,
          name:        commitments[cat.id]?.name ?? cat.defaultName,
          definition:  cat.id === 'hydration' ? '' : (commitments[cat.id]?.definition ?? ''),
          sortOrder:   i,
          targetValue: cat.id === 'hydration' ? parseFloat(hydrationGoal) || 64 : undefined,
          targetUnit:  cat.id === 'hydration' ? hydrationUnit : undefined,
        }))
      )
      setSaving(false)
      setShowWelcome(true)
    } catch (e: any) {
      setSaveError(e.message ?? 'Something went wrong')
      setSaving(false)
    }
  }

  // ── Welcome overlay ─────────────────────────────────────────────────────

  if (showWelcome) {
    const NAV_ITEMS = [
      { label: 'Today',    desc: 'Tap each commitment as you finish it. Changes save instantly.' },
      { label: 'Progress', desc: 'Your calendar — every day you\'ve shown up, at a glance.' },
      { label: 'Profile',  desc: 'Your plan. Redefine commitments, adjust the duration, or add new habits — any time.' },
      { label: '? Button', desc: 'Quick help, available on every screen.' },
    ]
    return (
      <div className="min-h-screen bg-green-800 flex flex-col max-w-xl mx-auto px-6">
        <div className="flex-1 flex flex-col justify-center py-16">
          {/* Success mark */}
          <div className="w-14 h-14 rounded-full bg-green-600 border-2 border-green-400 flex items-center justify-center mb-8">
            <span className="text-green-200 text-xl font-bold">✓</span>
          </div>

          <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mb-2">Challenge started</p>
          <h1 className="font-display text-[40px] font-semibold tracking-tight text-surface leading-tight mb-4">
            You&apos;re In.
          </h1>
          <p className="font-sans text-sm text-green-300 leading-relaxed mb-8">
            Your {duration}-day challenge starts today. Here&apos;s how to get around:
          </p>

          <div className="flex flex-col gap-5 mb-10">
            {NAV_ITEMS.map(item => (
              <div key={item.label} className="flex gap-4">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest w-16 shrink-0 pt-0.5">
                  {item.label}
                </span>
                <p className="font-sans text-sm text-green-200 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="font-sans text-xs text-green-400 leading-relaxed">
            Nothing is locked in — your commitments, definitions, and challenge length can all change as you go.
          </p>
        </div>

        <div className="pb-10">
          <Btn
            variant="primary"
            onClick={() => router.push('/today')}
            className="!bg-green-300 !text-green-900 hover:brightness-110"
          >
            Let&apos;s Go →
          </Btn>
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────

  const selectedCategories = CATEGORIES.filter(c => selected.has(c.id))
  const canContinueStep2   = selected.size >= 2

  // Dark slide screens
  if (step === 'slides') {
    const slide = SLIDES[slideIndex]
    const isLast = slideIndex === SLIDES.length - 1

    return (
      <div
        className="min-h-screen bg-green-700 flex flex-col max-w-xl mx-auto px-6 cursor-pointer select-none"
        onClick={!isLast ? nextSlide : undefined}
      >
        {/* Logo */}
        <div className="pt-12 pb-2 flex items-center gap-3">
          <Image src="/brand/75flex-logo-heart.png" alt="75 Flex" width={36} height={36} className="opacity-90" />
          <Eyebrow color="green" className="text-[15px]">75 Flex</Eyebrow>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center pb-10">
          <Eyebrow color="green" className="text-[13px] mb-4">{slide.eyebrow}</Eyebrow>
          <h1 className="font-display text-[44px] font-semibold tracking-tight text-surface leading-tight mb-7">{slide.title}</h1>
          <p className="font-sans text-lg text-green-200 leading-relaxed">{slide.body}</p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === slideIndex ? 'w-4 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-green-500'
              }`}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="pb-10 flex flex-col gap-3">
          {isLast ? (
            <Btn variant="primary" onClick={e => { e.stopPropagation(); nextSlide() }} className="!bg-green-300 !text-green-900 hover:brightness-110">
              {slide.cta ?? 'Build my challenge'}
            </Btn>
          ) : (
            <p className="text-center font-sans text-sm text-green-400">Tap to continue</p>
          )}
        </div>
      </div>
    )
  }

  // Plan Step 1 — Template
  if (step === 'plan-1') {
    return (
      <div className="min-h-screen bg-green-700 flex flex-col max-w-xl mx-auto px-6">
        <div className="pt-12">
          <Eyebrow color="green" className="text-[11px]">Step 1 of 3</Eyebrow>
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-surface mt-1 mb-1">Choose a Starting Point</h1>
          <p className="font-sans text-sm text-green-300 mb-6">You can customize everything on the next step.</p>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {([
            {
              id: '75_soft' as Template,
              name: '75 Soft',
              tag: 'Recommended',
              desc: 'Flexible defaults — you define what each commitment means. Built for real life.',
              commitments: ['One Workout', 'Nutrition', 'Water', 'Personal Development'],
            },
            {
              id: '75_hard' as Template,
              name: '75 Hard',
              tag: 'Strict',
              desc: 'The original challenge. Two 45-min workouts (one outside), strict diet, 10 pages non-fiction, one gallon water.',
              commitments: ['Two Workouts (1 Outside)', 'Strict Diet', 'One Gallon Water', '10 Pages Non-Fiction', 'Progress Photo'],
            },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`w-full text-left rounded-card border-[1.5px] px-4 py-4 transition-colors ${
                template === t.id ? 'border-amber-400 bg-green-500' : 'border-green-500 bg-green-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display text-lg font-bold text-surface">{t.name}</p>
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded uppercase tracking-widest ${
                  t.id === '75_soft' ? 'bg-heart/20 text-heart' : 'bg-green-500/30 text-green-200'
                }`}>
                  {t.tag}
                </span>
                {template === t.id && <span className="ml-auto text-amber-400 text-sm">✓</span>}
              </div>
              <p className="font-sans text-sm text-green-300 leading-relaxed mb-2">{t.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {t.commitments.map(c => (
                  <span key={c} className="font-mono text-[11px] bg-green-500/25 text-green-100 px-2 py-1 rounded">
                    {c}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="py-8 flex flex-col gap-3">
          <Btn
            variant="primary"
            className="!bg-green-300 !text-green-900 hover:brightness-110"
            onClick={() => {
              // Pre-select default categories for the chosen template
              if (template === '75_soft') {
                const defaults = ['physical', 'nutrition', 'hydration', 'personal_dev']
                const newSelected = new Set(defaults)
                setSelected(newSelected)
                const newCommits: Record<string, Commitment> = {}
                defaults.forEach(id => {
                  const cat = CATEGORIES.find(c => c.id === id)!
                  newCommits[id] = { categoryId: id, name: cat.defaultName, definition: cat.defaultDefinition }
                })
                setCommits(newCommits)
              } else {
                const defaults = ['physical', 'nutrition', 'hydration', 'personal_dev', 'photo']
                const newSelected = new Set(defaults)
                setSelected(newSelected)
                const newCommits: Record<string, Commitment> = {}
                defaults.forEach(id => {
                  const cat = CATEGORIES.find(c => c.id === id)!
                  newCommits[id] = { categoryId: id, name: cat.defaultName, definition: cat.defaultDefinition }
                })
                setCommits(newCommits)
              }
              setStep('plan-2')
            }}
          >
            Continue
          </Btn>
          <Btn variant="ghost" onClick={() => { setSlide(SLIDES.length - 1); setStep('slides') }}>
            Back
          </Btn>
        </div>
      </div>
    )
  }

  // Plan Step 2 — Category selector
  if (step === 'plan-2') {
    return (
      <div className="min-h-screen bg-green-700 flex flex-col max-w-xl mx-auto px-6">
        <div className="pt-12">
          <Eyebrow color="green" className="text-[11px]">Step 2 of 3</Eyebrow>
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-surface mt-1 mb-1">Choose Your Commitments</h1>
          <p className="font-sans text-sm text-green-300 mb-1">
            Select at least 2.
            {selected.size < 2 && (
              <span className="text-heart"> Select at least {2 - selected.size} more to continue.</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 py-5 flex-1">
          {CATEGORIES.map(cat => {
            const isSelected = selected.has(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`rounded-card border-[1.5px] px-4 py-3 text-left transition-colors ${
                  isSelected ? 'border-amber-400 bg-green-500' : 'border-green-500 bg-green-600'
                }`}
              >
                <p className="font-sans text-base font-medium text-surface">{cat.label}</p>
                {isSelected && <p className="font-mono text-[10px] text-amber-400 mt-0.5">✓ Selected</p>}
              </button>
            )
          })}
        </div>

        <div className="py-8 flex flex-col gap-3">
          <Btn
            variant="primary"
            onClick={() => setStep('plan-3')}
            disabled={!canContinueStep2}
            className={!canContinueStep2 ? '!bg-green-700 !text-green-500' : '!bg-green-300 !text-green-900 hover:brightness-110'}
          >
            Continue
          </Btn>
          <Btn variant="ghost" onClick={() => setStep('plan-1')}>
            Back
          </Btn>
        </div>
      </div>
    )
  }

  // Plan Step 3 — Define commitments
  if (step === 'plan-3') {
    const allNamed = selectedCategories.length > 0

    return (
      <div className="min-h-screen bg-green-800 flex flex-col max-w-xl mx-auto">
        <div className="px-6 pt-12">
          <Eyebrow color="green" className="text-[11px]">Step 3 of 3</Eyebrow>
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-surface mt-1 mb-1">Define Your Commitments</h1>
          <p className="font-sans text-sm text-green-300 mb-5">You can change these any time during your challenge.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-3 pb-4">

          {/* Duration picker */}
          <div className="bg-green-600 border-[1.5px] border-green-500 rounded-card px-4 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] text-green-300 uppercase tracking-widest">Challenge Length</p>
              <p className="font-mono text-[10px] text-green-100">
                {duration} days · ends {new Date(Date.now() + (duration - 1) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              {[21, 30, 75, 90].map(d => (
                <button
                  key={d}
                  onClick={() => { setDuration(d); setShowCustomDuration(false) }}
                  className={`flex-1 py-2 rounded-lg border-[1.5px] font-mono text-[11px] transition-colors ${
                    duration === d && !showCustomDuration
                      ? 'border-green-300 bg-green-300/20 text-green-300'
                      : 'border-green-500 bg-green-900/40 text-surface'
                  }`}
                >
                  {d}{d === 75 ? '★' : ''}
                </button>
              ))}
              <button
                onClick={() => setShowCustomDuration(true)}
                className={`flex-1 py-2 rounded-lg border-[1.5px] font-mono text-[11px] transition-colors ${
                  showCustomDuration
                    ? 'border-green-300 bg-green-300/20 text-green-300'
                    : 'border-green-500 bg-green-900/40 text-surface'
                }`}
              >
                Custom
              </button>
            </div>
            {showCustomDuration && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customDuration}
                  onChange={e => {
                    setCustomDuration(e.target.value)
                    const n = parseInt(e.target.value)
                    if (n >= 21 && n <= 180) setDuration(n)
                  }}
                  placeholder="21–180 days"
                  className="flex-1 bg-green-900/40 border-[1.5px] border-green-500 rounded-lg px-3 py-2 font-mono text-xs text-surface placeholder:text-green-300 outline-none focus:border-green-300"
                />
              </div>
            )}
          </div>

          {selectedCategories.map(cat => {
            const c = commitments[cat.id] ?? { categoryId: cat.id, name: cat.defaultName, definition: '' }
            return (
              <div key={cat.id} className="bg-green-600 border-[1.5px] border-green-500 rounded-card px-4 py-4 flex flex-col gap-2">
                <p className="font-display text-base font-semibold text-surface leading-tight">{c.name}</p>
                {cat.id === 'hydration' ? (
                  <>
                    <div className="flex rounded-lg overflow-hidden border-[1.5px] border-green-500 mt-1">
                      {(['oz', 'ml'] as const).map((u, i) => (
                        <button
                          key={u}
                          onClick={() => setHydUnit(u)}
                          className={`flex-1 py-2 font-sans text-xs font-medium transition-colors ${
                            i === 1 ? 'border-l border-green-500' : ''
                          } ${hydrationUnit === u ? 'bg-green-300 text-green-900' : 'bg-green-900/40 text-green-200'}`}
                        >
                          {u === 'oz' ? 'Ounces' : 'Milliliters'}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={hydrationGoal}
                      onChange={e => setHydGoal(e.target.value)}
                      placeholder={hydrationUnit === 'oz' ? 'e.g. 64' : 'e.g. 2000'}
                      className="bg-green-900/40 border-[1.5px] border-green-500 rounded-lg px-3 py-2 font-sans text-sm text-surface placeholder:text-green-300 outline-none focus:border-green-300"
                    />
                    <p className="font-mono text-[10px] text-green-200">
                      {hydrationUnit === 'oz' ? '64 oz ≈ 8 cups · 100 oz ≈ 3 liters' : '1000 ml = 1 liter · 3000 ml = 3 liters'}
                    </p>
                  </>
                ) : (
                  <textarea
                    value={c.definition}
                    onChange={e => updateCommitment(cat.id, 'definition', e.target.value)}
                    placeholder={cat.id === 'photo'
                      ? 'An optional daily photo — your workout, a meal, or any moment that captures where you are in this journey.'
                      : 'What does this mean to you? (optional)'}
                    rows={2}
                    className="bg-green-900/40 border-[1.5px] border-green-500 rounded-lg px-3 py-2 font-sans text-sm text-surface placeholder:text-green-300 outline-none resize-none focus:border-green-300"
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="px-6 py-8 flex flex-col gap-3">
          {saveError && (
            <div className="bg-red-950/80 border border-red-500/70 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-red-400 text-sm mt-px shrink-0">⚠</span>
              <p className="font-sans text-sm text-red-200 leading-snug">{saveError}</p>
            </div>
          )}
          <Btn
            variant="primary"
            onClick={handleStart}
            disabled={!allNamed || saving}
            className={(!allNamed || saving) ? '!bg-green-700 !text-green-500' : '!bg-green-300 !text-green-900 hover:brightness-110'}
          >
            {saving ? 'Starting…' : 'Start My Challenge'}
          </Btn>
          <Btn variant="ghost" onClick={() => setStep('plan-2')}>
            Back
          </Btn>
        </div>
      </div>
    )
  }
}
