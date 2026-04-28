'use client'

import Btn from '@/components/ui/Btn'

interface Props {
  photoUrl: string
  onClose: () => void
  onReplace: () => void
  onDelete: () => void
}

export default function PhotoViewerSheet({ photoUrl, onClose, onReplace, onDelete }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col max-w-xl mx-auto bg-black">
      <div className="flex items-center justify-between px-4 py-3 bg-black/70">
        <p className="font-mono text-[10px] uppercase tracking-widest text-surface/90">Progress photo</p>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full border border-surface/40 text-surface/90 text-sm"
          aria-label="Close photo"
        >
          X
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-3 py-3">
        <img src={photoUrl} alt="Progress photo full view" className="max-h-full max-w-full object-contain rounded-lg" />
      </div>

      <div className="bg-black/80 border-t border-surface/20 px-4 py-3 flex flex-col gap-2">
        <Btn variant="dark" onClick={onReplace}>
          Replace photo
        </Btn>
        <Btn variant="destructive" onClick={onDelete}>
          Delete photo
        </Btn>
      </div>
    </div>
  )
}
