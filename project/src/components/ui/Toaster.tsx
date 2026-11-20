import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

const config = {
  success: { icon: CheckCircle2, cls: 'text-success border-success/30 bg-white' },
  error: { icon: AlertCircle, cls: 'text-error border-error/30 bg-white' },
  info: { icon: Info, cls: 'text-forest border-forest/30 bg-white' },
};

export default function Toaster() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2.5 w-[min(360px,calc(100vw-2rem))] no-print">
      {toasts.map((t) => {
        const { icon: Icon, cls } = config[t.kind];
        return (
          <div key={t.id} className={`flex items-start gap-3 rounded-xl border shadow-lift px-4 py-3 animate-toast-in ${cls}`}>
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm text-primary-text leading-snug flex-1">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="text-secondary-text hover:text-primary-text -m-1 p-1">
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
