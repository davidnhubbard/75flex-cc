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

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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
      router.push('/today')
    } catch (e: any) {
      setSaveError(e.message ?? 'Something went wrong')
      setSaving(false)
    }
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
        className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto px-6 cursor-pointer select-none"
        onClick={!isLast ? nextSlide : undefined}
      >
        {/* Logo */}
        <div className="pt-12 pb-2 flex items-center gap-2">
          <Image src="/brand/75flex-logo-heart.png" alt="75 Flex" width={24} height={24} className="opacity-80" />
          <Eyebrow color="green" className="text-[11px]">75 Flex</Eyebrow>
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
                i === slideIndex ? 'w-4 h-1.5 bg-heart' : 'w-1.5 h-1.5 bg-green-700'
              }`}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="pb-10 flex flex-col gap-3">
          {isLast ? (
            <Btn variant="primary" onClick={e => { e.stopPropagation(); nextSlide() }}>
              {slide.cta ?? 'Build my challenge'}
            </Btn>
          ) : (
            <p className="text-center font-sans text-sm text-green-600">Tap to continue</p>
          )}
        </div>
      </div>
    )
  }

  // Plan Step 1 — Template
  if (step === 'plan-1') {
    return (
      <div className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto px-6">
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
                template === t.id ? 'border-heart bg-green-800' : 'border-green-700 bg-green-800/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display text-lg font-bold text-surface">{t.name}</p>
                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded uppercase tracking-widest ${
                  t.id === '75_soft' ? 'bg-heart/20 text-heart' : 'bg-green-700 text-green-300'
                }`}>
                  {t.tag}
                </span>
                {template === t.id && <span className="ml-auto text-heart text-sm">✓</span>}
              </div>
              <p className="font-sans text-sm text-green-300 leading-relaxed mb-2">{t.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {t.commitments.map(c => (
                  <span key={c} className="font-mono text-[11px] bg-green-700/60 text-green-200 px-2 py-1 rounded">
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
      <div className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto px-6">
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
                  isSelected ? 'border-heart bg-green-800' : 'border-green-700 bg-green-800/50'
                }`}
              >
                <p className="font-sans text-base font-medium text-surface">{cat.label}</p>
                {isSelected && <p className="font-mono text-[10px] text-heart mt-0.5">✓ Selected</p>}
              </button>
            )
          })}
        </div>

        <div className="py-8 flex flex-col gap-3">
          <Btn
            variant="primary"
            onClick={() => setStep('plan-3')}
            disabled={!canContinueStep2}
            className={!canContinueStep2 ? 'bg-heart/30 text-ink/40' : ''}
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
      <div className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto">
        <div className="px-6 pt-12">
          <Eyebrow color="green" className="text-[11px]">Step 3 of 3</Eyebrow>
          <h1 className="font-display text-[28px] font-semibold tracking-tight text-surface mt-1 mb-1">Define Your Commitments</h1>
          <p className="font-sans text-sm text-green-300 mb-5">You can change these any time during your challenge.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-3 pb-4">

          {/* Duration picker */}
          <div className="bg-green-800 border-[1.5px] border-green-700 rounded-card px-4 py-3 flex flex-col gap-2">
            <p className="font-mono text-[9px] text-green-400 uppercase tracking-widest">Challenge Length</p>
            <div className="flex gap-2">
              {[21, 30, 75, 90].map(d => (
                <button
                  key={d}
                  onClick={() => { setDuration(d); setShowCustomDuration(false) }}
                  className={`flex-1 py-1.5 rounded-lg border-[1.5px] font-mono text-[10px] transition-colors ${
                    duration === d && !showCustomDuration
                      ? 'border-heart bg-heart/20 text-heart'
                      : 'border-green-600 bg-green-700/50 text-green-300'
                  }`}
                >
                  {d}{d === 75 ? '★' : ''}
                </button>
              ))}
              <button
                onClick={() => setShowCustomDuration(true)}
                className={`flex-1 py-1.5 rounded-lg border-[1.5px] font-mono text-[10px] transition-colors ${
                  showCustomDuration
                    ? 'border-heart bg-heart/20 text-heart'
                    : 'border-green-600 bg-green-700/50 text-green-300'
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
                  placeholder="21–180"
                  className="flex-1 bg-green-700/50 border-[1.5px] border-green-600 rounded-lg px-3 py-2 font-mono text-xs text-surface placeholder:text-green-500 outline-none focus:border-heart"
                />
                <p className="font-mono text-[9px] text-green-500">days</p>
              </div>
            )}
            <p className="font-mono text-[9px] text-green-500">
              {duration} days · ends {new Date(Date.now() + (duration - 1) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>

          {selectedCategories.map(cat => {
            const c = commitments[cat.id] ?? { categoryId: cat.id, name: cat.defaultName, definition: '' }
            return (
              <div key={cat.id} className="bg-green-800 border-[1.5px] border-green-700 rounded-card px-4 py-3 flex flex-col gap-2">
                <p className="font-mono text-[9px] text-green-400 uppercase tracking-widest">{cat.label}</p>
                {cat.id === 'hydration' ? (
                  <>
                    <p className="font-sans text-xs text-green-300">Daily water goal</p>
                    {/* Unit toggle */}
                    <div className="flex rounded-lg overflow-hidden border-[1.5px] border-green-600">
                      {(['oz', 'ml'] as const).map((u, i) => (
                        <button
                          key={u}
                          onClick={() => setHydUnit(u)}
                          className={`flex-1 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                            i === 1 ? 'border-l border-green-600' : ''
                          } ${hydrationUnit === u ? 'bg-heart text-surface' : 'bg-green-700/50 text-green-400'}`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={hydrationGoal}
                      onChange={e => setHydGoal(e.target.value)}
                      placeholder={hydrationUnit === 'oz' ? 'e.g. 64' : 'e.g. 2000'}
                      className="bg-green-700/50 border-[1.5px] border-green-600 rounded-lg px-3 py-2 font-sans text-xs text-surface placeholder:text-green-500 outline-none focus:border-heart"
                    />
                    <p className="font-mono text-[9px] text-green-500">
                      {hydrationUnit === 'oz' ? '64 oz ≈ 8 cups · 100 oz ≈ 3 liters' : '1000 ml = 1 liter · 3000 ml = 3 liters'}
                    </p>
                  </>
                ) : (
                  <textarea
                    value={c.definition}
                    onChange={e => updateCommitment(cat.id, 'definition', e.target.value)}
                    placeholder="What does this mean to you? (optional)"
                    rows={2}
                    className="bg-green-700/50 border-[1.5px] border-green-600 rounded-lg px-3 py-2 font-sans text-xs text-surface placeholder:text-green-500 outline-none resize-none focus:border-heart"
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="px-6 py-8 flex flex-col gap-3">
          {saveError && <p className="font-sans text-xs text-heart-deep text-center">{saveError}</p>}
          <Btn
            variant="primary"
            onClick={handleStart}
            disabled={!allNamed || saving}
            className={(!allNamed || saving) ? 'bg-heart/30 text-ink/40' : ''}
          >
            {saving ? 'Starting…' : 'Start my challenge'}
          </Btn>
          <Btn variant="ghost" onClick={() => setStep('plan-2')}>
            Back
          </Btn>
        </div>
      </div>
    )
  }
}
