import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  full?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-ivory hover:bg-forest-600 active:bg-forest-600 shadow-soft',
  secondary: 'bg-terracotta text-white hover:bg-terracotta-600 active:bg-terracotta-600 shadow-soft',
  outline: 'border border-border bg-white text-primary-text hover:bg-sand',
  ghost: 'text-primary-text hover:bg-sand',
  danger: 'bg-error text-white hover:brightness-95 shadow-soft',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3.5 py-2 rounded-lg gap-1.5',
  md: 'text-sm px-5 py-2.5 rounded-xl gap-2',
  lg: 'text-base px-6 py-3.5 rounded-xl gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  full,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
