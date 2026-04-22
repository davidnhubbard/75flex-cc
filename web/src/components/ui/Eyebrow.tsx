import { HTMLAttributes } from 'react';

type EyebrowColor = 'faint' | 'green';

interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  color?: EyebrowColor;
  className?: string;
}

const colorClasses: Record<EyebrowColor, string> = {
  faint: 'font-mono text-[9px] text-ink-faint uppercase tracking-widest',
  green: 'font-mono text-[9px] text-green-400 uppercase tracking-widest',
};

export default function Eyebrow({
  color = 'faint',
  className = '',
  ...props
}: EyebrowProps) {
  const baseClasses = colorClasses[color];
  const combined = `${baseClasses} ${className}`.trim();

  return <p className={combined} {...props} />;
}
