import { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'light' | 'dark'
  className?: string
}

const variantClasses = {
  light: 'w-full bg-green-50 border-[1.5px] border-green-200 focus:border-heart rounded-xl px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink-faint outline-none resize-none',
  dark:  'w-full bg-green-700/50 border-[1.5px] border-green-600 focus:border-heart rounded-xl px-3 py-2 font-sans text-sm text-surface placeholder:text-green-500 outline-none resize-none',
}

export default function Textarea({ variant = 'light', className = '', ...props }: TextareaProps) {
  return <textarea className={`${variantClasses[variant]} ${className}`.trim()} {...props} />
}
