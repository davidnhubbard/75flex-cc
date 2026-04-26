'use client'

import { useRef, useEffect, useState } from 'react'
import Btn from '@/components/ui/Btn'

interface Props {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraSheet({ onCapture, onClose }: Props) {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const fileRef    = useRef<HTMLInputElement>(null)

  const [captured,     setCaptured]     = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [error,        setError]        = useState<string | null>(null)
  const [starting,     setStarting]     = useState(true)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    setStarting(true)
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setError("Camera access denied — check browser permissions or upload a file instead.")
    } finally {
      setStarting(false)
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  function handleCapture() {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      setCapturedBlob(blob)
      setCaptured(canvas.toDataURL('image/jpeg'))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  function handleRetake() {
    setCaptured(null)
    setCapturedBlob(null)
    startCamera()
  }

  function handleUse() {
    if (!capturedBlob) return
    onCapture(new File([capturedBlob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onCapture(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-xl mx-auto">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-card rounded-t-[20px] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-4 mb-3 shrink-0" />

        {captured ? (
          <>
            <img src={captured} alt="Captured" className="w-full aspect-[4/3] object-cover" />
            <div className="px-5 py-4 flex flex-col gap-3 shrink-0">
              <Btn variant="dark" onClick={handleUse}>Use photo</Btn>
              <Btn variant="ghost" onClick={handleRetake}>Retake</Btn>
            </div>
          </>
        ) : (
          <>
            <div className="relative bg-black aspect-[4/3] w-full flex items-center justify-center">
              {starting && !error && (
                <p className="font-sans text-xs text-white/50 absolute">Starting camera…</p>
              )}
              {error ? (
                <div className="mx-6 bg-red-950/90 border border-red-500/70 rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="text-red-400 text-sm mt-px shrink-0">⚠</span>
                  <p className="font-sans text-sm text-red-200 leading-snug">{error}</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="px-5 py-4 flex flex-col gap-3 shrink-0">
              {!error && (
                <Btn variant="dark" onClick={handleCapture} disabled={starting}>
                  Take photo
                </Btn>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="font-sans text-sm text-ink-soft text-center py-1"
              >
                Upload from device instead
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
