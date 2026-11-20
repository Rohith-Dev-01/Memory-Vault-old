import { useState } from 'react';
import { BookHeart, Plus, Pencil, Trash2, Quote } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import type { Memory } from '@/lib/types';
import { Card, SectionHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';

export default function MemoriesPage() {
  const { state, currentUser, addMemory, updateMemory, deleteMemory } = useApp();
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; memory?: Memory } | null>(null);
  const [confirm, setConfirm] = useState<Memory | null>(null);
  const [form, setForm] = useState({ title: '', message: '', recipient: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!currentUser) return null;
  const memories = state.memories.filter((m) => m.ownerId === currentUser.id);

  const openAdd = () => { setForm({ title: '', message: '', recipient: '' }); setErrors({}); setModal({ mode: 'add' }); };
  const openEdit = (m: Memory) => { setForm({ title: m.title, message: m.message, recipient: m.recipient }); setErrors({}); setModal({ mode: 'edit', memory: m }); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Give this memory a title.';
    if (!form.message.trim()) errs.message = 'Write your message.';
    if (!form.recipient.trim()) errs.recipient = 'Who is this for?';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (modal?.mode === 'edit' && modal.memory) updateMemory(modal.memory.id, form);
    else addMemory(form);
    setModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 lg:py-12 space-y-6">
      <SectionHeader
        eyebrow="Module E · Memories & letters"
        title="Words for the people you love"
        subtitle="Save letters, stories, and memories intended for specific people. These will be part of your legacy summary."
        action={<Button icon={<Plus size={17} />} onClick={openAdd}>New memory</Button>}
      />

      {memories.length === 0 ? (
        <Card><EmptyState icon={<BookHeart size={22} />} title="No memories saved" message="Write a letter to someone who matters. It only takes a moment." action={<Button icon={<Plus size={17} />} onClick={openAdd}>Write your first letter</Button>} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {memories.map((m) => (
            <Card key={m.id} className="p-6 relative overflow-hidden">
              <Quote className="absolute -top-2 -left-1 text-terracotta/10" size={64} />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl text-primary-text">{m.title}</h3>
                    <p className="text-xs text-secondary-text mt-1">For {m.recipient}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(m)} className="p-2 text-secondary-text hover:text-forest rounded-lg hover:bg-sand transition-colors"><Pencil size={16} /></button>
                    <button onClick={() => setConfirm(m)} className="p-2 text-secondary-text hover:text-error rounded-lg hover:bg-sand transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <p className="text-sm text-primary-text/90 mt-4 leading-relaxed whitespace-pre-wrap">{m.message}</p>
                <p className="text-xs text-secondary-text mt-5 pt-4 border-t border-border">{new Date(m.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit memory' : 'New memory'}
        subtitle="Take your time. These words matter."
        size="lg"
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button onClick={submit}>{modal?.mode === 'edit' ? 'Save changes' : 'Save memory'}</Button></>}
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title" required error={errors.title}><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="For Sophie, on our anniversary" /></Field>
          <Field label="Intended recipient" required error={errors.recipient}><Input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="Sophie Hartwell" /></Field>
          <Field label="Message" required error={errors.message}><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-[180px]" placeholder="My love, if you are reading this…" /></Field>
        </form>
      </Modal>

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={() => confirm && deleteMemory(confirm.id)} title="Delete memory?" message={<>“{confirm?.title}” will be permanently removed.</>} confirmLabel="Delete" />
    </div>
  );
}
