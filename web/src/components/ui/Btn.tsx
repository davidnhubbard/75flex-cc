import { ButtonHTMLAttributes } from 'react';

type BtnVariant = 'primary' | 'dark' | 'outline' | 'ghost' | 'destructive';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: BtnVariant;
  disabled?: boolean;
  className?: string;
}

const variantClasses: Record<BtnVariant, string> = {
  primary: 'bg-heart text-surface hover:bg-heart-deep font-sans text-sm font-semibold py-3.5 rounded-xl w-full',
  dark: 'bg-green-700 text-surface font-sans text-sm font-semibold py-3 rounded-xl w-full',
  outline: 'bg-[#A8D7B2] border-[1.5px] border-[#4F8C60] text-[#1E4A2A] font-sans text-sm font-medium rounded-xl py-3',
  destructive: 'bg-heart-deep text-surface font-sans text-sm font-semibold py-2.5 rounded-xl w-full',
  ghost: 'text-ink-faint font-sans text-sm font-medium',
};

export default function Btn({
  variant,
  disabled = false,
  className = '',
  ...props
}: BtnProps) {
  const baseClasses = variantClasses[variant];
  const disabledClasses = disabled ? 'opacity-50 cursor-default' : '';
  const combined = `${baseClasses} ${disabledClasses} ${className}`.trim();

  return (
    <button
      disabled={disabled}
      className={combined}
      {...props}
    />
  );
}
