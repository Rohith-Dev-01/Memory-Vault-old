import { useState } from 'react';
import { ShieldCheck, Send, Clock, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Card, SectionHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Field, Select, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';

export default function LegacyAccessPage() {
  const { state, submitLegacyRequest, notify } = useApp();
  const [ownerEmail, setOwnerEmail] = useState('');
  const [contactId, setContactId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // A contact is identified by the owner's email + the contact's own record.
  // Find owner user by email:
  const owner = state.users.find((u) => u.email.toLowerCase() === ownerEmail.trim().toLowerCase());
  const eligibleContacts = owner
    ? state.trustedContacts.filter((c) => c.ownerId === owner.id && c.invitationStatus === 'accepted')
    : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!owner) { setError('No vault found for that email address.'); return; }
    if (!contactId) { setError('Select which trusted contact you are.'); return; }
    if (reason.trim().length < 20) { setError('Please explain your reason in at least a sentence or two.'); return; }
    const res = submitLegacyRequest({ contactId, reason });
    if (!res.ok) { setError(res.error ?? 'Could not submit request.'); return; }
    notify('success', 'Your legacy access request has been submitted for admin review.');
    setReason(''); setContactId(''); setSubmitted(true);
  };

  // Show existing requests by this contact (matched by email)
  const myRequests = owner
    ? state.legacyRequests.filter((r) => r.ownerId === owner.id && eligibleContacts.some((c) => c.id === r.contactId))
    : [];

  const statusMeta = {
    pending: { tone: 'warning' as const, icon: Clock, label: 'Pending review' },
    approved: { tone: 'success' as const, icon: CheckCircle2, label: 'Approved' },
    rejected: { tone: 'error' as const, icon: XCircle, label: 'Rejected' },
  };

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 lg:py-12 space-y-6">
      <SectionHeader
        eyebrow="Module H · Legacy access"
        title="Legacy access requests"
        subtitle="Trusted contacts can request access to a vault owner's authorized information. Every request is reviewed by an administrator before anything is released."
      />

      <div className="rounded-xl border border-terracotta/30 bg-[#FBF1EC] px-4 py-3.5 flex items-start gap-3">
        <AlertTriangle size={18} className="text-terracotta mt-0.5 shrink-0" />
        <p className="text-sm text-primary-text"><span className="font-medium">Inactivity is not proof of death.</span> No private information is ever released automatically. Each request requires explicit administrative review and approval, and only information the owner explicitly authorized is shared.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Request form */}
        <Card className="p-6">
          <h3 className="text-lg text-primary-text flex items-center gap-2"><Send size={18} className="text-forest" /> Submit a request</h3>
          <p className="text-sm text-secondary-text mt-1">For demonstration, enter the vault owner's email and identify yourself as one of their accepted trusted contacts.</p>

          <form onSubmit={submit} className="mt-5 space-y-4">
            {error && <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>}
            {submitted && <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success flex items-center gap-2"><CheckCircle2 size={16} /> Request submitted. The admin will review it shortly.</div>}
            <Field label="Vault owner's email" required hint="The email address of the person whose vault you are requesting access to.">
              <input className="w-full bg-ivory border border-border rounded-xl px-4 py-2.5 text-sm text-primary-text placeholder:text-secondary-text/60 focus:outline-none focus:border-forest focus:bg-white" value={ownerEmail} onChange={(e) => { setOwnerEmail(e.target.value); setContactId(''); setSubmitted(false); }} placeholder="amelia.hartwell@example.com" />
            </Field>
            <Field label="I am" required>
              <Select value={contactId} onChange={(e) => setContactId(e.target.value)} disabled={!owner}>
                <option value="">{owner ? 'Select your name…' : 'Enter owner email first'}</option>
                {eligibleContacts.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.relationship}</option>)}
              </Select>
            </Field>
            {owner && eligibleContacts.length === 0 && (
              <p className="text-xs text-error">No accepted trusted contacts found for this vault. Only contacts who accepted an invitation may submit a request.</p>
            )}
            <Field label="Reason for request" required hint="Explain why access is needed. The administrator will review this.">
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="I have not heard from Amelia in over a month and would like to retrieve the family photos she trusted me with." />
            </Field>
            <Button full type="submit" icon={<Send size={16} />}>Submit request</Button>
          </form>
        </Card>

        {/* My requests + info */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg text-primary-text flex items-center gap-2"><FileText size={18} className="text-forest" /> Requests from you</h3>
            {myRequests.length === 0 ? (
              <div className="py-8 text-center"><ShieldCheck size={24} className="mx-auto text-secondary-text/50" /><p className="text-sm text-secondary-text mt-2">No requests submitted yet.</p></div>
            ) : (
              <div className="mt-4 space-y-3">
                {myRequests.map((r) => {
                  const st = statusMeta[r.status];
                  return (
                    <div key={r.id} className="rounded-xl border border-border bg-ivory p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-secondary-text">{new Date(r.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <Badge tone={st.tone} icon={<st.icon size={12} />}>{st.label}</Badge>
                      </div>
                      <p className="text-sm text-primary-text mt-2">{r.reason}</p>
                      {r.reviewNote && <p className="text-xs text-secondary-text mt-2 pt-2 border-t border-border">Admin note: {r.reviewNote}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-forest text-ivory border-forest">
            <ShieldCheck size={22} className="text-terracotta" />
            <h3 className="text-lg mt-3">How access works</h3>
            <ol className="mt-3 space-y-2 text-sm text-ivory/80 list-decimal list-inside">
              <li>A trusted contact submits a request with a reason.</li>
              <li>An administrator reviews the request and verifies identity.</li>
              <li>Only information the owner explicitly authorized is released.</li>
              <li>Inactivity alone never triggers automatic release.</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
