import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-border shadow-soft ${hover ? 'transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ eyebrow, title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 ${className}`}>
      <div>
        {eyebrow && <p className="text-xs uppercase tracking-[0.18em] text-secondary-text mb-2 font-medium">{eyebrow}</p>}
        <h2 className="text-2xl md:text-3xl text-primary-text">{title}</h2>
        {subtitle && <p className="text-secondary-text mt-1.5 text-sm md:text-base max-w-xl">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({ icon, label, value, hint, accent = 'forest' }: { icon: ReactNode; label: string; value: ReactNode; hint?: string; accent?: 'forest' | 'terracotta' | 'success' | 'warning' | 'error' }) {
  const colors: Record<string, string> = {
    forest: 'bg-forest-50 text-forest',
    terracotta: 'bg-[#F3E4DD] text-terracotta',
    success: 'bg-[#E6EFE8] text-success',
    warning: 'bg-[#F5EAD8] text-warning',
    error: 'bg-[#F2E0DE] text-error',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[accent]}`}>{icon}</div>
      </div>
      <p className="text-3xl font-display text-primary-text mt-4">{value}</p>
      <p className="text-sm text-secondary-text mt-1">{label}</p>
      {hint && <p className="text-xs text-secondary-text/70 mt-2">{hint}</p>}
    </Card>
  );
}
