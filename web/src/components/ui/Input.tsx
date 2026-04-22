import { InputHTMLAttributes } from 'react';

type InputVariant = 'light' | 'dark';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant: InputVariant;
  className?: string;
}

const variantClasses: Record<InputVariant, string> = {
  light: 'w-full bg-green-50 border-[1.5px] border-green-200 focus:border-green-600 rounded-xl px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink-faint outline-none',
  dark: 'w-full bg-green-800 border-[1.5px] border-green-700 focus:border-ember rounded-xl px-4 py-3 font-sans text-sm text-surface placeholder:text-green-500 outline-none',
};

export default function Input({
  variant,
  className = '',
  ...props
}: InputProps) {
  const baseClasses = variantClasses[variant];
  const combined = `${baseClasses} ${className}`.trim();

  return <input className={combined} {...props} />;
}
