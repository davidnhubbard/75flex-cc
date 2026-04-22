import { ButtonHTMLAttributes } from 'react';

type BtnVariant = 'primary' | 'dark' | 'outline' | 'ghost';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: BtnVariant;
  disabled?: boolean;
  className?: string;
}

const variantClasses: Record<BtnVariant, string> = {
  primary: 'bg-citrus text-ink font-sans text-sm font-semibold py-3.5 rounded-xl w-full',
  dark: 'bg-green-800 text-citrus font-sans text-sm font-semibold py-3 rounded-xl w-full',
  outline: 'border-[1.5px] border-green-700 text-green-700 font-sans text-sm font-medium rounded-xl',
  ghost: 'text-green-700 font-sans text-sm font-medium',
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
