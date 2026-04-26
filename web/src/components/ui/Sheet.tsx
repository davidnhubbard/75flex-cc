import { ReactNode } from 'react';

interface SheetProps {
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export default function Sheet({ onClose, children, className = '' }: SheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-surface rounded-t-2xl w-full max-w-xl px-6 pt-6 pb-10 shadow-xl ${className}`}>
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />
        {children}
      </div>
    </div>
  );
}
