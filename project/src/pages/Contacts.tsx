import { useState } from 'react';
import { Users, Plus, Pencil, Trash2, Mail, Phone, CheckCircle2, Clock, XCircle, Send, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import type { InvitationStatus, TrustedContact } from '@/lib/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';

const statusMeta: Record<InvitationStatus, { label: string; tone: 'success' | 'warning' | 'error'; icon: typeof Clock }> = {
  pending: { label: 'Pending', tone: 'warning', icon: Clock },
  accepted: { label: 'Accepted', tone: 'success', icon: CheckCircle2 },
  declined: { label: 'Declined', tone: 'error', icon: XCircle },
};

export default function ContactsPage() {
  const { state, currentUser, addContact, updateContact, deleteContact, sendInvitation, notify } = useApp();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; contact?: TrustedContact } | null>(null);
  const [invite, setInvite] = useState<TrustedContact | null>(null);
  const [confirm, setConfirm] = useState<TrustedContact | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', relationship: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;
  const contacts = state.trustedContacts.filter((c) => c.ownerId === currentUser.id);

  const openAdd = () => { setForm({ name: '', email: '', phone: '', relationship: '' }); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (c: TrustedContact) => { setForm({ name: c.name, email: c.email, phone: c.phone, relationship: c.relationship }); setErrors({}); setModal({ mode: 'edit', contact: c }); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.phone.trim()) errs.phone = 'Phone is required.';
    if (!form.relationship.trim()) errs.relationship = 'Relationship is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (modal?.mode === 'edit' && modal.contact) updateContact(modal.contact.id, form);
    else addContact(form);
    setModal(null);
  };

  const sendInvite = () => {
    if (!invite) return;
    sendInvitation(invite.id);
    notify('success', `Invitation sent to ${invite.name} at ${invite.email}. Status: Pending.`);
    setInvite(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 lg:py-12 space-y-6">
      <SectionHeader
        eyebrow="Module D · Trusted contacts"
        title="People you trust"
        subtitle="Nominate contacts who can check on your wellbeing and, eventually, carry out your wishes. Accepting an invitation never grants automatic access to your private data."
        action={<Button icon={<Plus size={17} />} onClick={openAdd}>Add contact</Button>}
      />

      <div className="rounded-xl border border-forest/15 bg-forest-50 px-4 py-3 flex items-start gap-3">
        <ShieldCheck size={18} className="text-forest mt-0.5 shrink-0" />
        <p className="text-sm text-forest/80">Accepting an invitation only confirms the relationship. Access to any private information always requires an admin-approved legacy request.</p>
      </div>

      {contacts.length === 0 ? (
        <Card><EmptyState icon={<Users size={22} />} title="No contacts yet" message="Add someone you trust — a family member, partner, or close friend." action={<Button icon={<Plus size={17} />} onClick={openAdd}>Add your first contact</Button>} /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {contacts.map((c) => {
            const st = statusMeta[c.invitationStatus];
            return (
              <Card key={c.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-forest text-ivory flex items-center justify-center font-display text-lg">{c.name.charAt(0)}</div>
                    <div>
                      <h3 className="text-lg text-primary-text">{c.name}</h3>
                      <p className="text-sm text-secondary-text">{c.relationship}</p>
                    </div>
                  </div>
                  <Badge tone={st.tone} icon={<st.icon size={12} />}>{st.label}</Badge>
                </div>
                <div className="mt-4 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-secondary-text"><Mail size={15} className="text-secondary-text/70" /> {c.email}</p>
                  <p className="flex items-center gap-2 text-secondary-text"><Phone size={15} className="text-secondary-text/70" /> {c.phone}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <button onClick={() => setInvite(c)} className="text-sm font-medium text-forest hover:text-forest-600 inline-flex items-center gap-1.5"><Send size={15} /> {c.invitationStatus === 'pending' ? 'Resend invite' : 'Send invite'}</button>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(c)} className="p-2 text-secondary-text hover:text-forest rounded-lg hover:bg-sand transition-colors"><Pencil size={16} /></button>
                    <button onClick={() => setConfirm(c)} className="p-2 text-secondary-text hover:text-error rounded-lg hover:bg-sand transition-colors"><Trash2 size={16} /></button>
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
        title={modal?.mode === 'edit' ? 'Edit contact' : 'Add trusted contact'}
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button onClick={submit}>{modal?.mode === 'edit' ? 'Save changes' : 'Add contact'}</Button></>}
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Full name" required error={errors.name}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Daniel Hartwell" /></Field>
          <Field label="Email" required error={errors.email}><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="daniel@example.com" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone" required error={errors.phone}><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0142" /></Field>
            <Field label="Relationship" required error={errors.relationship}><Input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="Brother" /></Field>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!invite}
        onClose={() => setInvite(null)}
        title="Send invitation"
        size="sm"
        footer={<><Button variant="ghost" onClick={() => setInvite(null)}>Cancel</Button><Button onClick={sendInvite} icon={<Send size={16} />}>Send email</Button></>}
      >
        <p className="text-sm text-secondary-text">An invitation email will be sent to <span className="font-medium text-primary-text">{invite?.name}</span> at <span className="font-medium text-primary-text">{invite?.email}</span> with a secure, single-use acceptance token.</p>
        <div className="mt-4 rounded-xl border border-border bg-ivory p-4">
          <p className="text-xs text-secondary-text mb-2">Preview</p>
          <p className="text-sm text-primary-text">Dear {invite?.name},</p>
          <p className="text-sm text-secondary-text mt-1.5">{currentUser?.fullName} has nominated you as a trusted contact in their Memory Vault legacy plan. Accepting does not grant access to any private data.</p>
          <p className="text-xs text-secondary-text mt-3 break-all">Token: {invite?.invitationToken.slice(0, 24)}…</p>
        </div>
      </Modal>

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && deleteContact(confirm.id)} title="Remove contact?" message={<>“{confirm?.name}” will be removed from your trusted contacts. Any legacy request from them will remain on record.</>} confirmLabel="Remove" />
    </div>
  );
}
