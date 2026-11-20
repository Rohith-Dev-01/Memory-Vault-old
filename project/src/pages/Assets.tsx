import { useState } from 'react';
import { FolderLock, Plus, Pencil, Trash2, Instagram, Facebook, Mail, Cloud, Image, CreditCard, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import type { AssetCategory, DigitalAsset } from '@/lib/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';

const CATEGORIES: AssetCategory[] = ['Social Media', 'Email & Communication', 'Cloud Storage', 'Photos & Media', 'Subscriptions', 'Finance & Banking', 'Other'];

const PLATFORM_ICONS: Record<string, typeof Instagram> = {
  Instagram: Instagram, Facebook: Facebook, Gmail: Mail, 'Google Photos': Image, 'Google Drive': Cloud, Spotify: CreditCard,
};

const categoryTone: Record<AssetCategory, 'forest' | 'terracotta' | 'success' | 'warning' | 'info' | 'neutral' | 'error'> = {
  'Social Media': 'terracotta',
  'Email & Communication': 'forest',
  'Cloud Storage': 'info',
  'Photos & Media': 'success',
  Subscriptions: 'warning',
  'Finance & Banking': 'error',
  Other: 'neutral',
};

export default function AssetsPage() {
  const { state, currentUser, addAsset, updateAsset, deleteAsset } = useApp();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; asset?: DigitalAsset } | null>(null);
  const [confirm, setConfirm] = useState<DigitalAsset | null>(null);
  const [form, setForm] = useState({ name: '', platform: '', category: 'Social Media' as AssetCategory, accountIdentifier: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;
  const assets = state.digitalAssets.filter((a) => a.ownerId === currentUser.id);

  const openAdd = () => { setForm({ name: '', platform: '', category: 'Social Media', accountIdentifier: '', description: '' }); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (a: DigitalAsset) => { setForm({ name: a.name, platform: a.platform, category: a.category, accountIdentifier: a.accountIdentifier, description: a.description }); setErrors({}); setModal({ mode: 'edit', asset: a }); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Asset name is required.';
    if (!form.platform.trim()) errs.platform = 'Platform is required.';
    if (!form.accountIdentifier.trim()) errs.accountIdentifier = 'Account identifier is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (modal?.mode === 'edit' && modal.asset) updateAsset(modal.asset.id, form);
    else addAsset(form);
    setModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 lg:py-12 space-y-6">
      <SectionHeader
        eyebrow="Module A · Digital assets"
        title="Your digital asset registry"
        subtitle="Catalog every account that matters. We never ask for third-party passwords — only an identifier and a description."
        action={<Button icon={<Plus size={17} />} onClick={openAdd}>Add asset</Button>}
      />

      <div className="rounded-xl border border-forest/15 bg-forest-50 px-4 py-3 flex items-start gap-3">
        <ShieldCheck size={18} className="text-forest mt-0.5 shrink-0" />
        <p className="text-sm text-forest/80">Memory Vault never collects or stores passwords to your other accounts. Only an identifier (username, handle, or email) and a description are saved.</p>
      </div>

      {assets.length === 0 ? (
        <Card><EmptyState icon={<FolderLock size={22} />} title="No assets yet" message="Add your first digital asset to start building your legacy plan." action={<Button icon={<Plus size={17} />} onClick={openAdd}>Add your first asset</Button>} /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((a) => {
            const Icon = PLATFORM_ICONS[a.platform] ?? MoreHorizontal;
            const wish = state.finalWishes.find((w) => w.assetId === a.id);
            return (
              <Card key={a.id} className="p-5 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-forest-50 text-forest flex items-center justify-center"><Icon size={20} /></div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="p-2 -m-2 text-secondary-text hover:text-forest rounded-lg hover:bg-sand transition-colors"><Pencil size={16} /></button>
                    <button onClick={() => setConfirm(a)} className="p-2 -m-2 text-secondary-text hover:text-error rounded-lg hover:bg-sand transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="mt-4 text-lg text-primary-text">{a.name}</h3>
                <p className="text-sm text-secondary-text mt-0.5">{a.platform}</p>
                <div className="mt-3"><Badge tone={categoryTone[a.category]}>{a.category}</Badge></div>
                <p className="text-sm text-secondary-text mt-3 leading-relaxed flex-1">{a.description}</p>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-secondary-text">{a.accountIdentifier}</span>
                  {wish ? <Badge tone="success">Wish set</Badge> : <Badge tone="neutral">No wish</Badge>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit asset' : 'Add digital asset'}
        subtitle="Never enter third-party passwords here."
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button onClick={submit}>{modal?.mode === 'edit' ? 'Save changes' : 'Add asset'}</Button></>}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Asset name" required error={errors.name}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Personal Instagram" /></Field>
            <Field label="Platform" required error={errors.platform}><Input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Instagram, Gmail, Google Drive…" /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category" required>
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AssetCategory })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Account identifier" required error={errors.accountIdentifier} hint="Username, handle, or email — never a password."><Input value={form.accountIdentifier} onChange={(e) => setForm({ ...form, accountIdentifier: e.target.value })} placeholder="@your_handle" /></Field>
          </div>
          <Field label="Description" hint="What does this account contain? Why does it matter?"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A decade of family photos and travel memories…" /></Field>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && deleteAsset(confirm.id)}
        title="Delete asset?"
        message={<>This will permanently remove “{confirm?.name}” and any final wish linked to it. This cannot be undone.</>}
        confirmLabel="Delete"
      />
    </div>
  );
}
