import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, error, hint, required, children }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-primary-text mb-1.5">
        {label} {required && <span className="text-terracotta">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-xs text-secondary-text mt-1.5">{hint}</span>}
      {error && <span className="block text-xs text-error mt-1.5">{error}</span>}
    </label>
  );
}

const baseInput =
  'w-full bg-ivory border border-border rounded-xl px-4 py-2.5 text-sm text-primary-text placeholder:text-secondary-text/60 transition-all focus:outline-none focus:border-forest focus:bg-white focus:ring-2 focus:ring-forest/10';

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${baseInput} ${className}`} {...rest} />;
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseInput} resize-y min-h-[110px] ${className}`} {...rest} />;
}

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${baseInput} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%23777B70%22 d=%22M2 4l4 4 4-4%22/></svg>')] bg-no-repeat bg-[right_1rem_center] pr-10 ${className}`} {...rest}>
      {children}
    </select>
  );
}
