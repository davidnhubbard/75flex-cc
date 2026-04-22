'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { createChallenge, createCommitments, todayISO } from '@/lib/queries'
import Btn from '@/components/ui/Btn'
import Eyebrow from '@/components/ui/Eyebrow'

// ─── Types ───────────────────────────────────────────────────────────────────

type Template = '75_soft' | '75_hard'

interface Category {
  id: string
  label: string
  defaultName: string
  defaultDefinition: string
}

interface Commitment {
  categoryId: string
  name: string
  definition: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    eyebrow: 'Welcome to',
    title: '75 Flex',
    body: 'A 75-day personal challenge engine built on one idea: consistency over perfection. Same structure as 75 Hard — your rules.',
  },
  {
    eyebrow: 'Your challenge',
    title: 'Your rules.',
    body: 'Pick the commitments that matter to you. Define what "done" means. No rigid templates, no one-size-fits-all.',
  },
  {
    eyebrow: 'No forced resets',
    title: 'Ever.',
    body: 'Missing a day doesn\'t restart your challenge. Life happens. Your history is preserved and you keep going from where you left off.',
  },
  {
    eyebrow: 'Ready?',
    title: 'Build your challenge.',
    body: 'It takes about 2 minutes. You can change anything later.',
    cta: 'Build my challenge',
  },
]

const CATEGORIES: Category[] = [
  { id: 'physical',      label: 'Physical',       defaultName: 'One workout',    defaultDefinition: 'At least 30 minutes of intentional movement' },
  { id: 'nutrition',     label: 'Nutrition',      defaultName: 'Nutrition',      defaultDefinition: 'Follow your plan, no junk food' },
  { id: 'hydration',     label: 'Hydration',      defaultName: 'Water',          defaultDefinition: 'Drink at least 64 oz of water' },
  { id: 'personal_dev',  label: 'Personal dev',   defaultName: 'Personal dev',   defaultDefinition: '10 minutes of reading or a podcast' },
  { id: 'photo',         label: 'Progress photo', defaultName: 'Progress photo', defaultDefinition: '' },
  { id: 'sleep',         label: 'Sleep',          defaultName: 'Sleep',          defaultDefinition: 'In bed by 10:30pm' },
  { id: 'mindfulness',   label: 'Mindfulness',    defaultName: 'Mindfulness',    defaultDefinition: '10 minutes of meditation or journaling' },
  { id: 'cold_shower',   label: 'Cold shower',    defaultName: 'Cold shower',    defaultDefinition: 'End shower with 30 seconds cold' },
]

// ─── Step type ───────────────────────────────────────────────────────────────

type Step = 'slides' | 'plan-1' | 'plan-2' | 'plan-3'

// ─── Component ───────────────────────────────────────────────────────────────

export default function OnboardingContent() {
  const router = useRouter()

  const [step, setStep]           = useState<Step>('slides')
  const [slideIndex, setSlide]    = useState(0)
  const [template, setTemplate]   = useState<Template>('75_soft')
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [commitments, setCommits] = useState<Record<string, Commitment>>({})

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
        title:     template === '75_soft' ? '75 Soft challenge' : '75 Hard challenge',
        template,
        startDate: todayISO(),
      })
      await createCommitments(supabase, challenge.id,
        selectedCategories.map((cat, i) => ({
          category:   cat.id,
          name:       commitments[cat.id]?.name ?? cat.defaultName,
          definition: commitments[cat.id]?.definition ?? '',
          sortOrder:  i,
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
      <div className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto px-6">
        {/* Logo */}
        <div className="pt-12 pb-2 flex items-center gap-2">
          <Image src="/brand/75flex-logo-heart.png" alt="75 Flex" width={24} height={24} className="opacity-80" />
          <Eyebrow color="green" className="text-[10px]">75 Flex</Eyebrow>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center pb-10">
          <Eyebrow color="green" className="mb-2">{slide.eyebrow}</Eyebrow>
          <h1 className="font-display text-[32px] font-black text-surface leading-tight mb-5">{slide.title}</h1>
          <p className="font-sans text-sm text-green-200 leading-relaxed">{slide.body}</p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === slideIndex ? 'w-4 h-1.5 bg-citrus' : 'w-1.5 h-1.5 bg-green-700'
              }`}
            />
          ))}
        </div>

        {/* Nav */}
        <div className="pb-10 flex flex-col gap-3">
          <Btn variant="primary" onClick={nextSlide}>
            {isLast ? (slide.cta ?? 'Next') : 'Next'}
          </Btn>
          {slideIndex > 0 && (
            <button onClick={prevSlide} className="text-green-400 font-sans text-sm text-center py-1">
              Back
            </button>
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
          <Eyebrow color="green" className="text-[10px]">Step 1 of 3</Eyebrow>
          <h1 className="font-display text-2xl font-bold text-surface mt-1 mb-1">Choose a starting point</h1>
          <p className="font-sans text-xs text-green-300 mb-6">You can customize everything on the next step.</p>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {([
            {
              id: '75_soft' as Template,
              name: '75 Soft',
              tag: 'Recommended',
              desc: 'Flexible defaults — you define what each commitment means. Built for real life.',
              commitments: ['One workout', 'Nutrition', 'Water', 'Personal dev'],
            },
            {
              id: '75_hard' as Template,
              name: '75 Hard',
              tag: 'Strict',
              desc: 'The original challenge. Two 45-min workouts (one outside), strict diet, 10 pages non-fiction, one gallon water.',
              commitments: ['Two workouts (1 outside)', 'Strict diet', 'One gallon water', '10 pages non-fiction', 'Progress photo'],
            },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`w-full text-left rounded-card border-[1.5px] px-4 py-4 transition-colors ${
                template === t.id ? 'border-citrus bg-green-800' : 'border-green-700 bg-green-800/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="font-display text-base font-bold text-surface">{t.name}</p>
                <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest ${
                  t.id === '75_soft' ? 'bg-citrus/20 text-citrus' : 'bg-green-700 text-green-300'
                }`}>
                  {t.tag}
                </span>
                {template === t.id && <span className="ml-auto text-citrus text-sm">✓</span>}
              </div>
              <p className="font-sans text-xs text-green-300 leading-relaxed mb-2">{t.desc}</p>
              <div className="flex flex-wrap gap-1">
                {t.commitments.map(c => (
                  <span key={c} className="font-mono text-[8px] bg-green-700/60 text-green-200 px-1.5 py-0.5 rounded">
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
          <button onClick={() => { setSlide(SLIDES.length - 1); setStep('slides') }} className="text-green-400 font-sans text-sm text-center py-1">
            Back
          </button>
        </div>
      </div>
    )
  }

  // Plan Step 2 — Category selector
  if (step === 'plan-2') {
    return (
      <div className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto px-6">
        <div className="pt-12">
          <Eyebrow color="green" className="text-[10px]">Step 2 of 3</Eyebrow>
          <h1 className="font-display text-2xl font-bold text-surface mt-1 mb-1">Choose your commitments</h1>
          <p className="font-sans text-xs text-green-300 mb-1">
            Select at least 2.
            {selected.size < 2 && (
              <span className="text-citrus"> Select at least {2 - selected.size} more to continue.</span>
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
                  isSelected ? 'border-citrus bg-green-800' : 'border-green-700 bg-green-800/50'
                }`}
              >
                <p className="font-sans text-sm font-medium text-surface">{cat.label}</p>
                {isSelected && <p className="font-mono text-[8px] text-citrus mt-0.5">✓ selected</p>}
              </button>
            )
          })}
        </div>

        <div className="py-8 flex flex-col gap-3">
          <Btn
            variant="primary"
            onClick={() => setStep('plan-3')}
            disabled={!canContinueStep2}
            className={!canContinueStep2 ? 'bg-citrus/30 text-ink/40' : ''}
          >
            Continue
          </Btn>
          <button onClick={() => setStep('plan-1')} className="text-green-400 font-sans text-sm text-center py-1">
            Back
          </button>
        </div>
      </div>
    )
  }

  // Plan Step 3 — Define commitments
  if (step === 'plan-3') {
    const allNamed = selectedCategories.every(cat => commitments[cat.id]?.name?.trim())

    return (
      <div className="min-h-screen bg-green-900 flex flex-col max-w-xl mx-auto">
        <div className="px-6 pt-12">
          <Eyebrow color="green" className="text-[10px]">Step 3 of 3</Eyebrow>
          <h1 className="font-display text-2xl font-bold text-surface mt-1 mb-1">Define your commitments</h1>
          <p className="font-sans text-xs text-green-300 mb-5">You can change these any time during your challenge.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-3 pb-4">
          {selectedCategories.map(cat => {
            const c = commitments[cat.id] ?? { categoryId: cat.id, name: cat.defaultName, definition: '' }
            return (
              <div key={cat.id} className="bg-green-800 border-[1.5px] border-green-700 rounded-card px-4 py-3 flex flex-col gap-2">
                <p className="font-mono text-[9px] text-green-400 uppercase tracking-widest">{cat.label}</p>
                <input
                  value={c.name}
                  onChange={e => updateCommitment(cat.id, 'name', e.target.value)}
                  placeholder="Commitment name"
                  className="bg-green-700/50 border-[1.5px] border-green-600 rounded-lg px-3 py-2 font-sans text-sm text-surface placeholder:text-green-500 outline-none focus:border-citrus"
                />
                <textarea
                  value={c.definition}
                  onChange={e => updateCommitment(cat.id, 'definition', e.target.value)}
                  placeholder="What does this mean to you? (optional)"
                  rows={2}
                  className="bg-green-700/50 border-[1.5px] border-green-600 rounded-lg px-3 py-2 font-sans text-xs text-surface placeholder:text-green-500 outline-none resize-none focus:border-citrus"
                />
              </div>
            )
          })}
        </div>

        <div className="px-6 py-8 flex flex-col gap-3">
          {saveError && <p className="font-sans text-xs text-amber text-center">{saveError}</p>}
          <Btn
            variant="primary"
            onClick={handleStart}
            disabled={!allNamed || saving}
            className={(!allNamed || saving) ? 'bg-citrus/30 text-ink/40' : ''}
          >
            {saving ? 'Starting…' : 'Start my challenge'}
          </Btn>
          <button onClick={() => setStep('plan-2')} className="text-green-400 font-sans text-sm text-center py-1">
            Back
          </button>
        </div>
      </div>
    )
  }
}
