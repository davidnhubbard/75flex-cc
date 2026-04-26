'use client'

import { useState } from 'react'
import Btn from '@/components/ui/Btn'
import Textarea from '@/components/ui/Textarea'
import CameraSheet from '@/components/CameraSheet'

interface Props {
  initialPhotoUrl?: string | null
  initialNotes?: string | null
  onSave: (notes: string, file: File | null) => Promise<void>
  onClose: () => void
}

export default function BenchmarkSheet({ initialPhotoUrl, initialNotes, onSave, onClose }: Props) {
  const [notes,   setNotes]   = useState(initialNotes ?? '')
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl ?? null)
  const [file,    setFile]    = useState<File | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  function handleCapture(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setShowCamera(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(notes, file)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-xl mx-auto">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card rounded-t-[20px] px-5 pt-5 pb-8 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-1" />

        <p className="font-display text-[18px] font-semibold tracking-tight text-ink leading-snug">
          Starting benchmark
        </p>

        {/* Photo */}
        <div>
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Benchmark"
                className="w-full aspect-video object-cover rounded-card"
              />
              <button
                onClick={() => setShowCamera(true)}
                className="absolute bottom-2 right-2 bg-ink/60 text-surface font-sans text-xs px-3 py-1.5 rounded-full"
              >
                Change photo
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowCamera(true)}
              className="w-full aspect-video bg-surface border-[1.5px] border-dashed border-border rounded-card flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl">📷</span>
              <p className="font-sans text-sm text-ink-soft">Add a starting photo</p>
              <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest">Optional</p>
            </button>
          )}
        </div>

        {/* Notes */}
        <div>
          <p className="font-mono text-[9px] text-ink-faint uppercase tracking-widest mb-1.5">Notes</p>
          <Textarea
            variant="light"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Where are you starting from? Weight, measurements, or just how you feel."
            rows={4}
          />
        </div>

        <Btn variant="dark" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save benchmark'}
        </Btn>
        <Btn variant="ghost" onClick={onClose} className="text-center w-full">
          Cancel
        </Btn>
      </div>
    </div>

    {showCamera && (
      <CameraSheet onCapture={handleCapture} onClose={() => setShowCamera(false)} />
    )}
    </>
  )
}
