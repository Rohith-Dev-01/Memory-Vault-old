import { type ReactNode, useState } from 'react';
import {
  LayoutDashboard, FolderLock, HeartHandshake, Users, BookHeart,
  FileText, ShieldCheck, LogOut, Menu, X, CheckCircle2, Clock,
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { daysInactive } from '@/lib/monitoring';
import Badge from './ui/Badge';

export type Route =
  | 'landing' | 'register' | 'login'
  | 'dashboard' | 'assets' | 'wishes' | 'contacts' | 'memories'
  | 'summary' | 'legacy-access' | 'admin';

const nav: { route: Route; label: string; icon: ReactNode }[] = [
  { route: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { route: 'assets', label: 'Digital Assets', icon: <FolderLock size={18} /> },
  { route: 'wishes', label: 'Final Wishes', icon: <HeartHandshake size={18} /> },
  { route: 'contacts', label: 'Trusted Contacts', icon: <Users size={18} /> },
  { route: 'memories', label: 'Memories & Letters', icon: <BookHeart size={18} /> },
  { route: 'summary', label: 'Legacy Summary', icon: <FileText size={18} /> },
  { route: 'legacy-access', label: 'Legacy Access', icon: <ShieldCheck size={18} /> },
];

export default function Layout({ route, onNavigate, children }: { route: Route; onNavigate: (r: Route) => void; children: ReactNode }) {
  const { currentUser, logout, checkIn } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const d = currentUser ? daysInactive(currentUser) : 0;
  const inactivityStatus =
    d >= 45 ? { label: 'Contacts notified', tone: 'error' as const }
    : d >= 40 ? { label: 'Final reminder sent', tone: 'error' as const }
    : d >= 35 ? { label: 'Second reminder sent', tone: 'warning' as const }
    : d >= 30 ? { label: 'First reminder sent', tone: 'warning' as const }
    : { label: 'Active', tone: 'success' as const };

  const go = (r: Route) => { onNavigate(r); setMobileOpen(false); };

  return (
    <div className="min-h-screen bg-ivory-texture flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-border z-40 flex flex-col transition-transform duration-300 no-print ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-6 py-6 border-b border-border">
          <button onClick={() => go('dashboard')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-ivory font-display text-lg group-hover:bg-forest-600 transition-colors">M</div>
            <div className="text-left">
              <p className="font-display text-lg text-primary-text leading-none">Memory Vault</p>
              <p className="text-[11px] text-secondary-text tracking-wide mt-0.5">Digital Legacy</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 text-[10px] uppercase tracking-[0.16em] text-secondary-text/70 mb-2">Plan</p>
          <div className="space-y-1">
            {nav.map((item) => (
              <button
                key={item.route}
                onClick={() => go(item.route)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${route === item.route ? 'bg-forest text-ivory shadow-soft' : 'text-primary-text hover:bg-sand'}`}
              >
                <span className={route === item.route ? 'text-ivory' : 'text-secondary-text'}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <p className="px-3 text-[10px] uppercase tracking-[0.16em] text-secondary-text/70 mb-2 mt-6">Administration</p>
          <button
            onClick={() => go('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${route === 'admin' ? 'bg-forest text-ivory shadow-soft' : 'text-primary-text hover:bg-sand'}`}
          >
            <span className={route === 'admin' ? 'text-ivory' : 'text-secondary-text'}><ShieldCheck size={18} /></span>
            Admin Panel
          </button>
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-xl bg-ivory border border-border p-3.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary-text truncate">{currentUser?.fullName}</p>
                <p className="text-xs text-secondary-text truncate">{currentUser?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <Badge tone={inactivityStatus.tone} icon={inactivityStatus.tone === 'success' ? <CheckCircle2 size={12} /> : <Clock size={12} />}>
                {inactivityStatus.label}
              </Badge>
              <button onClick={checkIn} className="text-xs font-medium text-forest hover:text-forest-600">Check in</button>
            </div>
          </div>
          <button onClick={logout} className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-secondary-text hover:bg-sand hover:text-primary-text transition-colors">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-forest/20 backdrop-blur-sm z-30 lg:hidden no-print" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-border px-4 py-3 flex items-center justify-between no-print">
          <button onClick={() => go('dashboard')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-ivory font-display text-base">M</div>
            <span className="font-display text-base text-primary-text">Memory Vault</span>
          </button>
          <button onClick={() => setMobileOpen(true)} className="p-2 -m-2 text-primary-text">
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
