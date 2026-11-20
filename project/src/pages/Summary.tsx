import { FileText, Printer, FolderLock, HeartHandshake, Users, BookHeart, Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { completionPercentage, daysInactive, STAGES } from '@/lib/monitoring';
import { Card, SectionHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

const actionLabels: Record<string, string> = {
  preserve_account: 'Preserve the account',
  preserve_memories: 'Preserve selected memories',
  share_selected: 'Share selected information',
  memorialization: 'Request memorialization',
  request_deletion: 'Request deletion / cancellation',
};

export default function SummaryPage() {
  const { state, currentUser } = useApp();
  if (!currentUser) return null;

  const uid = currentUser.id;
  const assets = state.digitalAssets.filter((a) => a.ownerId === uid);
  const wishes = state.finalWishes.filter((w) => w.ownerId === uid);
  const contacts = state.trustedContacts.filter((c) => c.ownerId === uid);
  const memories = state.memories.filter((m) => m.ownerId === uid);
  const completion = completionPercentage(state, uid);
  const d = daysInactive(currentUser);
  const stage = d >= 45 ? 4 : d >= 40 ? 3 : d >= 35 ? 2 : d >= 30 ? 1 : 0;

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 lg:py-12 space-y-6">
      <div className="no-print">
        <SectionHeader
          eyebrow="Module J · Legacy summary"
          title="Your complete legacy plan"
          subtitle="A consolidated view of everything you have recorded. Print or save as PDF using your browser's print dialog."
          action={<Button icon={<Printer size={17} />} onClick={() => window.print()}>Print / Save as PDF</Button>}
        />
      </div>

      {/* Printable document */}
      <Card className="p-8 lg:p-12 print-page">
        {/* Letterhead */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-forest flex items-center justify-center text-ivory font-display text-2xl">M</div>
            <div>
              <p className="font-display text-2xl text-primary-text">Memory Vault</p>
              <p className="text-xs text-secondary-text tracking-wide">Digital Legacy Management</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary-text">Generated</p>
            <p className="text-sm text-primary-text">{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Owner */}
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-secondary-text">Prepared by</p>
            <h2 className="text-3xl text-primary-text mt-1">{currentUser.fullName}</h2>
            <p className="text-sm text-secondary-text mt-1">{currentUser.email} · @{currentUser.userId}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl text-terracotta">{completion}%</p>
            <p className="text-xs text-secondary-text">plan completion</p>
          </div>
        </div>

        {/* Assets */}
        <Section title="Digital assets" icon={<FolderLock size={18} />} count={assets.length}>
          {assets.length === 0 ? <EmptyRow text="No assets recorded." /> : (
            <div className="space-y-2">
              {assets.map((a) => (
                <div key={a.id} className="grid grid-cols-12 gap-3 items-start rounded-lg border border-border bg-ivory/50 px-4 py-3 text-sm">
                  <div className="col-span-12 sm:col-span-4"><p className="font-medium text-primary-text">{a.name}</p><p className="text-xs text-secondary-text">{a.platform}</p></div>
                  <div className="col-span-6 sm:col-span-3 text-secondary-text">{a.category}</div>
                  <div className="col-span-6 sm:col-span-3 text-secondary-text">{a.accountIdentifier}</div>
                  <div className="col-span-12 sm:col-span-2"><Badge tone="forest">{a.category}</Badge></div>
                  {a.description && <p className="col-span-12 text-xs text-secondary-text mt-1">{a.description}</p>}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Wishes */}
        <Section title="Final wishes" icon={<HeartHandshake size={18} />} count={wishes.length}>
          {wishes.length === 0 ? <EmptyRow text="No wishes recorded." /> : (
            <div className="space-y-2">
              {wishes.map((w) => {
                const asset = assets.find((a) => a.id === w.assetId);
                return (
                  <div key={w.id} className="rounded-lg border border-border bg-ivory/50 px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-primary-text">{actionLabels[w.action] ?? w.action}</span>
                      <Badge tone="terracotta">{asset?.name ?? 'Unlinked'}</Badge>
                    </div>
                    <p className="text-secondary-text mt-1.5">{w.instructions}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Contacts */}
        <Section title="Trusted contacts" icon={<Users size={18} />} count={contacts.length}>
          {contacts.length === 0 ? <EmptyRow text="No contacts added." /> : (
            <div className="grid sm:grid-cols-2 gap-2">
              {contacts.map((c) => (
                <div key={c.id} className="rounded-lg border border-border bg-ivory/50 px-4 py-3 text-sm">
                  <p className="font-medium text-primary-text">{c.name}</p>
                  <p className="text-xs text-secondary-text">{c.relationship} · {c.email}</p>
                  <p className="text-xs text-secondary-text">{c.phone}</p>
                  <div className="mt-2"><Badge tone={c.invitationStatus === 'accepted' ? 'success' : c.invitationStatus === 'pending' ? 'warning' : 'error'}>{c.invitationStatus}</Badge></div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Memories */}
        <Section title="Memories & letters" icon={<BookHeart size={18} />} count={memories.length}>
          {memories.length === 0 ? <EmptyRow text="No memories saved." /> : (
            <div className="space-y-3">
              {memories.map((m) => (
                <div key={m.id} className="rounded-lg border border-border bg-ivory/50 px-4 py-4 text-sm">
                  <p className="font-medium text-primary-text">{m.title}</p>
                  <p className="text-xs text-secondary-text mb-2">For {m.recipient}</p>
                  <p className="text-secondary-text whitespace-pre-wrap leading-relaxed">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Inactivity settings */}
        <Section title="Inactivity monitoring settings" icon={<Clock size={18} />}>
          <div className="rounded-lg border border-border bg-ivory/50 px-4 py-4 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-secondary-text">Last check-in</span><span className="text-primary-text">{new Date(currentUser.lastCheckIn).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
            <div className="flex justify-between"><span className="text-secondary-text">Days inactive</span><span className="text-primary-text">{d} days</span></div>
            <div className="flex justify-between"><span className="text-secondary-text">Current stage</span><span className="text-primary-text">{STAGES[stage]?.title ?? 'Active'}</span></div>
            <div className="pt-2 border-t border-border mt-2">
              <p className="text-xs text-secondary-text mb-1.5">Reminder schedule:</p>
              {STAGES.map((s) => (
                <div key={s.day} className="flex justify-between text-xs"><span className="text-secondary-text">Day {s.day}</span><span className="text-primary-text">{s.title}</span></div>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-forest/15 bg-forest-50 px-4 py-3 text-xs text-forest/80 flex items-start gap-2">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            Inactivity is not proof of death. Private information is released only after explicit administrative review and approval — never automatically.
          </div>
        </Section>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-xs text-secondary-text">This summary is generated by Memory Vault and forms part of a digital legacy plan. It is a demonstration prototype and not a legal document.</p>
        </div>
      </Card>
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count?: number; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-forest">{icon}</span>
        <h3 className="text-xl text-primary-text">{title}</h3>
        {count !== undefined && <span className="text-xs text-secondary-text bg-sand px-2 py-0.5 rounded-full">{count}</span>}
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-sm text-secondary-text italic rounded-lg border border-dashed border-border px-4 py-3">{text}</p>;
}
