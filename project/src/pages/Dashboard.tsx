import {
  FolderLock, Users, BookHeart, HeartHandshake, ArrowRight, CheckCircle2,
  Clock, BellRing, Activity, CalendarClock, Sparkles, AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { completionPercentage, daysInactive, nextStage, STAGES } from '@/lib/monitoring';
import { Card, SectionHeader, StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Route } from '@/components/Layout';

export default function Dashboard({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const { state, currentUser, checkIn, simulateStage } = useApp();
  if (!currentUser) return null;

  const uid = currentUser.id;
  const assets = state.digitalAssets.filter((a) => a.ownerId === uid);
  const contacts = state.trustedContacts.filter((c) => c.ownerId === uid);
  const memories = state.memories.filter((m) => m.ownerId === uid);
  const wishes = state.finalWishes.filter((w) => w.ownerId === uid);
  const completion = completionPercentage(state, uid);
  const d = daysInactive(currentUser);
  const { nextReminderDate } = nextStage(currentUser);

  const stage = d >= 45 ? 4 : d >= 40 ? 3 : d >= 35 ? 2 : d >= 30 ? 1 : 0;
  const stageInfo = [
    { label: 'Active', tone: 'success' as const, text: 'You are up to date. No reminders pending.' },
    { label: 'First reminder due', tone: 'warning' as const, text: 'Day 30 — a gentle check-in email would be sent.' },
    { label: 'Second reminder due', tone: 'warning' as const, text: 'Day 35 — a second reminder would be sent.' },
    { label: 'Final reminder due', tone: 'error' as const, text: 'Day 40 — final reminder before contacts are notified.' },
    { label: 'Contacts notified', tone: 'error' as const, text: 'Day 45 — trusted contacts asked to check on you. No private data released.' },
  ][stage];

  const recentNotifications = state.notificationLogs
    .filter((n) => n.ownerId === uid)
    .sort((a, b) => b.sentAt - a.sentAt)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Header */}
      <div className="animate-fade-up">
        <p className="text-xs uppercase tracking-[0.18em] text-secondary-text mb-2">Dashboard</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl text-primary-text">Hello, {currentUser.fullName.split(' ')[0]}</h1>
            <p className="text-secondary-text mt-2">Here is the state of your legacy plan.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" icon={<CheckCircle2 size={17} />} onClick={checkIn}>Check in</Button>
            <Button icon={<Sparkles size={17} />} onClick={() => onNavigate('assets')}>Add asset</Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '60ms' }}>
        <StatCard icon={<FolderLock size={20} />} label="Digital assets" value={assets.length} hint={`${wishes.length} with final wishes`} accent="forest" />
        <StatCard icon={<Users size={20} />} label="Trusted contacts" value={contacts.length} hint={`${contacts.filter((c) => c.invitationStatus === 'accepted').length} accepted`} accent="terracotta" />
        <StatCard icon={<BookHeart size={20} />} label="Saved memories" value={memories.length} hint="Letters & notes" accent="success" />
        <StatCard icon={<HeartHandshake size={20} />} label="Plan completion" value={`${completion}%`} hint={completion === 100 ? 'Complete' : 'In progress'} accent="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inactivity monitoring */}
        <Card className="lg:col-span-2 p-6 animate-fade-up" >
          <SectionHeader
            eyebrow="Inactivity monitoring"
            title="Your wellbeing cycle"
            subtitle="A login or check-in resets this cycle. After 45 days of silence, your trusted contacts are asked to check on you — never to access your data."
            action={<Badge tone={stageInfo.tone} icon={stage === 0 ? <CheckCircle2 size={12} /> : <Clock size={12} />}>{stageInfo.label}</Badge>}
          />

          {/* Timeline */}
          <div className="mt-6 grid grid-cols-5 gap-2">
            {STAGES.map((s, i) => {
              const reached = d >= s.day;
              const isCurrent = stage === i + 1;
              return (
                <div key={s.day} className={`rounded-xl border p-3 text-center transition-all ${reached ? 'border-forest/30 bg-forest-50' : 'border-border bg-ivory'} ${isCurrent ? 'ring-2 ring-terracotta/40' : ''}`}>
                  <p className={`font-display text-xl ${reached ? 'text-forest' : 'text-secondary-text'}`}>{s.day}</p>
                  <p className="text-[10px] text-secondary-text mt-0.5">day</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-ivory p-4 flex items-start gap-3">
            <Activity size={18} className="text-forest mt-0.5 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="text-primary-text">{stageInfo.text}</p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-secondary-text">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} className="text-success" /> Last check-in: {new Date(currentUser.lastCheckIn).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {nextReminderDate && <span className="inline-flex items-center gap-1.5"><CalendarClock size={13} /> Next reminder: {nextReminderDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>}
                <span className="inline-flex items-center gap-1.5"><Clock size={13} /> Inactive: {d} days</span>
              </div>
            </div>
          </div>

          {/* Demo simulation */}
          <div className="mt-5 rounded-xl border border-terracotta/30 bg-[#FBF1EC] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-terracotta" />
              <p className="text-sm font-medium text-primary-text">Demo simulation</p>
              <span className="text-[11px] text-secondary-text">— jump to any stage instantly</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Active', 'Day 30', 'Day 35', 'Day 40', 'Day 45'].map((label, i) => (
                <button
                  key={label}
                  onClick={() => simulateStage(i)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${stage === i ? 'bg-terracotta text-white border-terracotta' : 'bg-white text-primary-text border-border hover:border-terracotta'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 animate-fade-up" >
          <SectionHeader eyebrow="Activity" title="Notifications" />
          <div className="mt-5 space-y-3">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8">
                <BellRing size={24} className="mx-auto text-secondary-text/50" />
                <p className="text-sm text-secondary-text mt-2">No notifications yet.</p>
              </div>
            ) : (
              recentNotifications.map((n) => (
                <div key={n.id} className="flex gap-3 rounded-xl border border-border bg-ivory p-3.5">
                  <div className="w-8 h-8 rounded-lg bg-forest-50 text-forest flex items-center justify-center shrink-0"><BellRing size={15} /></div>
                  <div className="min-w-0">
                    <p className="text-sm text-primary-text leading-snug">{n.message}</p>
                    <p className="text-xs text-secondary-text mt-1">{new Date(n.sentAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick nav */}
      <div className="animate-fade-up">
        <SectionHeader eyebrow="Quick navigation" title="Jump to a module" />
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { route: 'assets' as Route, icon: FolderLock, title: 'Digital Assets', desc: 'Manage your online accounts', count: assets.length },
            { route: 'wishes' as Route, icon: HeartHandshake, title: 'Final Wishes', desc: 'Instructions for each asset', count: wishes.length },
            { route: 'contacts' as Route, icon: Users, title: 'Trusted Contacts', desc: 'People you trust', count: contacts.length },
            { route: 'memories' as Route, icon: BookHeart, title: 'Memories & Letters', desc: 'Words for your people', count: memories.length },
            { route: 'summary' as Route, icon: CheckCircle2, title: 'Legacy Summary', desc: 'Print-ready overview' },
            { route: 'legacy-access' as Route, icon: AlertTriangle, title: 'Legacy Access', desc: 'Requests from contacts' },
          ].map((m) => (
            <Card key={m.route} hover className="p-5" onClick={() => onNavigate(m.route)}>
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-forest-50 text-forest flex items-center justify-center"><m.icon size={20} /></div>
                <ArrowRight size={18} className="text-secondary-text" />
              </div>
              <h3 className="mt-4 text-lg text-primary-text">{m.title}</h3>
              <p className="text-sm text-secondary-text mt-0.5">{m.desc}</p>
              {m.count !== undefined && <p className="text-xs text-secondary-text/70 mt-3">{m.count} {m.count === 1 ? 'entry' : 'entries'}</p>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
