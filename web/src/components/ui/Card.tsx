import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Card({ className = '', ...props }: CardProps) {
  const baseClasses = 'bg-card border-[1.5px] border-border rounded-card';
  const combined = `${baseClasses} ${className}`.trim();

  return <div className={combined} {...props} />;
}
