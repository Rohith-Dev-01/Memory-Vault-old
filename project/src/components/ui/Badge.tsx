import { type ReactNode } from 'react';

type Tone = 'neutral' | 'forest' | 'terracotta' | 'success' | 'warning' | 'error' | 'info';

const tones: Record<Tone, string> = {
  neutral: 'bg-sand text-secondary-text border-border',
  forest: 'bg-forest-50 text-forest border-forest/20',
  terracotta: 'bg-[#F3E4DD] text-terracotta border-terracotta/25',
  success: 'bg-[#E6EFE8] text-success border-success/25',
  warning: 'bg-[#F5EAD8] text-warning border-warning/25',
  error: 'bg-[#F2E0DE] text-error border-error/25',
  info: 'bg-forest-50 text-forest border-forest/20',
};

export default function Badge({ tone = 'neutral', children, icon }: { tone?: Tone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${tones[tone]}`}>
      {icon}
      {children}
    </span>
  );
}
