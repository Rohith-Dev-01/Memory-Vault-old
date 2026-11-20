import { useState } from 'react';
import { HeartHandshake, Plus, Pencil, Trash2, Archive, Image, Share2, Sparkles, Ban } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import type { FinalWish, WishAction } from '@/lib/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import { Field, Select, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';

const ACTIONS: { value: WishAction; label: string; icon: typeof Archive; desc: string }[] = [
  { value: 'preserve_account', label: 'Preserve the account', icon: Archive, desc: 'Keep the account active and accessible to a designated person.' },
  { value: 'preserve_memories', label: 'Preserve selected memories', icon: Image, desc: 'Save specific photos, posts, or content as an archive.' },
  { value: 'share_selected', label: 'Share selected information', icon: Share2, desc: 'Release only certain information to a trusted contact.' },
  { value: 'memorialization', label: 'Request memorialization', icon: Sparkles, desc: 'Ask the provider to convert the account into a memorial.' },
  { value: 'request_deletion', label: 'Request deletion / cancellation', icon: Ban, desc: 'Ask the provider to delete the account through their official process.' },
];

export default function WishesPage() {
  const { state, currentUser, addWish, updateWish, deleteWish } = useApp();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; wish?: FinalWish } | null>(null);
  const [confirm, setConfirm] = useState<FinalWish | null>(null);
  const [form, setForm] = useState<{ assetId: string; action: WishAction; instructions: string }>({ assetId: '', action: 'preserve_memories', instructions: '' });
  const [error, setError] = useState('');

  if (!currentUser) return null;
  const assets = state.digitalAssets.filter((a) => a.ownerId === currentUser.id);
  const wishes = state.finalWishes.filter((w) => w.ownerId === currentUser.id);

  const openAdd = () => { setForm({ assetId: assets[0]?.id ?? '', action: 'preserve_memories', instructions: '' }); setError(''); setModal({ mode: 'add' }); };
  const openEdit = (w: FinalWish) => { setForm({ assetId: w.assetId ?? '', action: w.action, instructions: w.instructions }); setError(''); setModal({ mode: 'edit', wish: w }); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetId) { setError('Select an asset this wish applies to.'); return; }
    if (!form.instructions.trim()) { setError('Please write instructions for how this wish should be carried out.'); return; }
    if (modal?.mode === 'edit' && modal.wish) updateWish(modal.wish.id, form);
    else addWish(form);
    setModal(null);
  };

  const actionMeta = (a: WishAction) => ACTIONS.find((x) => x.value === a)!;

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 lg:py-12 space-y-6">
      <SectionHeader
        eyebrow="Module B · Final wishes"
        title="Instructions for your assets"
        subtitle="Tell your trusted contacts exactly what you want to happen to each account. These instructions guide — but never automatically release — your data."
        action={<Button icon={<Plus size={17} />} onClick={openAdd} disabled={assets.length === 0}>Add wish</Button>}
      />

      {assets.length === 0 ? (
        <Card><EmptyState icon={<HeartHandshake size={22} />} title="Add an asset first" message="Final wishes are tied to your digital assets. Add at least one asset to begin recording wishes." /></Card>
      ) : wishes.length === 0 ? (
        <Card><EmptyState icon={<HeartHandshake size={22} />} title="No wishes recorded" message="For each asset, record what should happen: preserve, memorialize, share, or delete." action={<Button icon={<Plus size={17} />} onClick={openAdd}>Record a wish</Button>} /></Card>
      ) : (
        <div className="space-y-4">
          {wishes.map((w) => {
            const asset = assets.find((a) => a.id === w.assetId);
            const meta = actionMeta(w.action);
            return (
              <Card key={w.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-terracotta/15 text-terracotta flex items-center justify-center shrink-0"><meta.icon size={22} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg text-primary-text">{meta.label}</h3>
                      <Badge tone="forest">{asset?.name ?? 'Unlinked asset'}</Badge>
                    </div>
                    <p className="text-sm text-secondary-text mt-1">{asset?.platform}</p>
                    <p className="text-sm text-primary-text mt-3 leading-relaxed">{w.instructions}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(w)} className="p-2 text-secondary-text hover:text-forest rounded-lg hover:bg-sand transition-colors"><Pencil size={16} /></button>
                    <button onClick={() => setConfirm(w)} className="p-2 text-secondary-text hover:text-error rounded-lg hover:bg-sand transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit final wish' : 'Record a final wish'}
        subtitle="Be specific. These words will guide your trusted contacts."
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button onClick={submit}>{modal?.mode === 'edit' ? 'Save changes' : 'Record wish'}</Button></>}
      >
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>}
          <Field label="Asset" required>
            <Select value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })}>
              <option value="">Select an asset…</option>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.platform}</option>)}
            </Select>
          </Field>
          <Field label="What should happen?" required>
            <div className="space-y-2">
              {ACTIONS.map((a) => (
                <label key={a.value} className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-all ${form.action === a.value ? 'border-forest bg-forest-50' : 'border-border bg-white hover:border-forest/40'}`}>
                  <input type="radio" name="action" className="mt-1 accent-forest" checked={form.action === a.value} onChange={() => setForm({ ...form, action: a.value })} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><a.icon size={16} className="text-forest" /><span className="text-sm font-medium text-primary-text">{a.label}</span></div>
                    <p className="text-xs text-secondary-text mt-1">{a.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Instructions" required hint="Describe exactly what you want done."><Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Please save my travel highlights as an archive and share it with my sister…" /></Field>
        </form>
      </Modal>

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && deleteWish(confirm.id)} title="Remove wish?" message="This instruction will be deleted. You can always record a new one." confirmLabel="Remove" />
    </div>
  );
}
