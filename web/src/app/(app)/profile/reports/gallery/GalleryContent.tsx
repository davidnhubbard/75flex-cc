'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import Sheet from '@/components/ui/Sheet'
import Btn from '@/components/ui/Btn'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase'
import { getActiveChallenge, getPhotoGalleryEntries, type PhotoGalleryEntry } from '@/lib/queries'

function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function reflectionLabel(reflection: PhotoGalleryEntry['reflection']) {
  if (!reflection) return ''
  if (reflection === 'felt_good') return 'Felt Good'
  if (reflection === 'tough_but_done') return 'Tough, But Done'
  return 'Almost Quit'
}

export default function GalleryContent() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<PhotoGalleryEntry[]>([])
  const [selected, setSelected] = useState<PhotoGalleryEntry | null>(null)
  const { toastMessage, showToast, clearToast } = useToast()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const challenge = await getActiveChallenge(supabase)
      if (!challenge) {
        router.push('/onboarding')
        return
      }

      const gallery = await getPhotoGalleryEntries(supabase, challenge.id)
      setEntries(gallery)
    } catch {
      showToast('Failed to load gallery')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="bg-green-800 px-5 pt-8 pb-4 animate-pulse">
          <div className="h-7 w-28 bg-green-700 rounded" />
        </div>
        <div className="px-4 py-5 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-border/50 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader title="Photo Diary" />

      <div className="px-4 py-5 flex flex-col gap-4">
        <p className="font-sans text-sm text-ink-soft leading-snug">
          Your visual progress timeline. Mobile uses a 2-column layout; desktop will expand responsively.
        </p>

        {entries.length === 0 ? (
          <div className="rounded-card border-[1.5px] border-dashed border-state-none bg-state-none-bg px-4 py-6 text-center">
            <p className="font-sans text-sm font-semibold text-ink">No Photos Yet</p>
            <p className="font-sans text-sm text-ink-soft mt-1">Add a photo commitment and start logging from Today to build your diary.</p>
            <div className="mt-3">
              <Btn variant="outline" onClick={() => router.push('/profile/plan?add=photo')}>
                Add Photo Commitment
              </Btn>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {entries.map(entry => {
              const firstLine = (entry.noteText ?? '').split(/\r?\n/)[0] ?? ''
              const notePreview = firstLine.length > 44 ? `${firstLine.slice(0, 41).trimEnd()}...` : firstLine
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelected(entry)}
                  className="text-left rounded-card border-[1.5px] border-state-none bg-state-none-bg overflow-hidden"
                >
                  <img
                    src={entry.photoUrl}
                    alt={`Day ${entry.dayNumber} progress photo`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="px-2.5 py-2">
                    <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest truncate">
                      Day {entry.dayNumber} · {formatDate(entry.logDate)}
                    </p>
                    <p className="font-sans text-xs font-medium text-ink truncate mt-1">{entry.commitmentName}</p>
                    {notePreview && (
                      <p className="font-sans text-[11px] text-ink-soft mt-0.5 leading-snug truncate">
                        {notePreview}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <Btn variant="outline" onClick={() => router.push('/profile/reports')}>
          Back To Reports
        </Btn>
      </div>

      {selected && (
        <Sheet onClose={() => setSelected(null)}>
          <div className="flex flex-col gap-3">
            <img
              src={selected.photoUrl}
              alt={`Day ${selected.dayNumber} progress photo`}
              className="w-full max-h-[56vh] object-contain rounded-lg border border-border bg-card"
            />
            <div className="flex flex-col gap-1">
              <p className="font-sans text-sm font-semibold text-ink">Day {selected.dayNumber} · {selected.commitmentName}</p>
              <p className="font-sans text-sm text-ink-soft">{formatDate(selected.logDate)}</p>
              {selected.reflection && (
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{reflectionLabel(selected.reflection)}</p>
              )}
            </div>
            {selected.noteText && (
              <div className="rounded-lg border border-border bg-card px-3 py-2">
                <p className="font-sans text-xs font-medium text-ink mb-1">Note</p>
                <p className="font-sans text-sm text-ink-soft whitespace-pre-wrap">{selected.noteText}</p>
              </div>
            )}
            <Btn variant="outline" onClick={() => setSelected(null)}>
              Close
            </Btn>
          </div>
        </Sheet>
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={clearToast} />}
    </div>
  )
}

