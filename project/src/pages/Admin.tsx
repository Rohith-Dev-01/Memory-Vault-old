import { useState } from 'react';
import { ShieldCheck, LogOut, Clock, CheckCircle2, XCircle, FileText, ScrollText, Eye, Inbox } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Card, SectionHeader, StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Field, Input, Textarea } from '@/components/ui/Field';
import type { LegacyRequest } from '@/lib/types';

export default function AdminPage() {
  const { state, currentAdmin, adminLogin, adminLogout, reviewRequest, appendAdminLog } = useApp();
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [review, setReview] = useState<{ request: LegacyRequest; status: 'approved' | 'rejected' } | null>(null);
  const [note, setNote] = useState('');
  const [tab, setTab] = useState<'pending' | 'reviewed' | 'logs'>('pending');

  if (!currentAdmin) {
    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      const res = adminLogin(creds.username, creds.password);
      if (!res.ok) { setError(res.error ?? 'Login failed.'); return; }
    };
    const demo = () => { setCreds({ username: 'admin', password: 'admin1234' }); setError(''); };
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5 py-12">
        <Card className="p-8 w-full max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-forest text-ivory flex items-center justify-center mx-auto"><ShieldCheck size={26} /></div>
          <h1 className="text-2xl text-primary-text text-center mt-5">Admin sign in</h1>
          <p className="text-sm text-secondary-text text-center mt-1">Review and approve legacy access requests.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">{error}</div>}
            <Field label="Username" required><Input value={creds.username} onChange={(e) => setCreds({ ...creds, username: e.target.value })} placeholder="admin" /></Field>
            <Field label="Password" required><Input type="password" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} placeholder="••••••••" /></Field>
            <Button full size="lg" type="submit">Sign in</Button>
            <button type="button" onClick={demo} className="w-full text-sm text-secondary-text hover:text-forest text-center">Use demo — <span className="font-medium">admin / admin1234</span></button>
          </form>
        </Card>
      </div>
    );
  }

  const pending = state.legacyRequests.filter((r) => r.status === 'pending');
  const approved = state.legacyRequests.filter((r) => r.status === 'approved');
  const rejected = state.legacyRequests.filter((r) => r.status === 'rejected');
  const reviewed = [...approved, ...rejected].sort((a, b) => (b.reviewedAt ?? 0) - (a.reviewedAt ?? 0));

  const openReview = (request: LegacyRequest, status: 'approved' | 'rejected') => {
    setReview({ request, status }); setNote('');
  };
  const confirmReview = () => {
    if (!review) return;
    reviewRequest(review.request.id, review.status, note);
    appendAdminLog(review.status === 'approved' ? 'Approved legacy request' : 'Rejected legacy request', `Request by ${review.request.requesterName} (${review.request.requesterEmail})`);
    setReview(null);
  };

  const tabs = [
    { id: 'pending' as const, label: 'Pending', count: pending.length, icon: Inbox },
    { id: 'reviewed' as const, label: 'Reviewed', count: reviewed.length, icon: CheckCircle2 },
    { id: 'logs' as const, label: 'Action logs', count: state.adminLogs.length, icon: ScrollText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 lg:py-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-secondary-text mb-2">Module I · Administration</p>
          <h1 className="text-3xl text-primary-text">Admin panel</h1>
          <p className="text-secondary-text mt-1.5">Review legacy access requests and maintain action logs.</p>
        </div>
        <Button variant="outline" icon={<LogOut size={16} />} onClick={adminLogout}>Sign out</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Clock size={20} />} label="Pending requests" value={pending.length} accent="warning" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Approved" value={approved.length} accent="success" />
        <StatCard icon={<XCircle size={20} />} label="Rejected" value={rejected.length} accent="error" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-forest text-forest' : 'border-transparent text-secondary-text hover:text-primary-text'}`}>
            <t.icon size={16} /> {t.label}
            <span className="text-xs bg-sand px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        pending.length === 0 ? (
          <Card className="p-12 text-center"><Inbox size={28} className="mx-auto text-secondary-text/50" /><p className="text-secondary-text mt-3">No pending requests. You are all caught up.</p></Card>
        ) : (
          <div className="space-y-4">
            {pending.map((r) => <RequestRow key={r.id} request={r} onReview={openReview} />)}
          </div>
        )
      )}

      {tab === 'reviewed' && (
        reviewed.length === 0 ? (
          <Card className="p-12 text-center"><CheckCircle2 size={28} className="mx-auto text-secondary-text/50" /><p className="text-secondary-text mt-3">No reviewed requests yet.</p></Card>
        ) : (
          <div className="space-y-4">
            {reviewed.map((r) => <RequestRow key={r.id} request={r} readOnly />)}
          </div>
        )
      )}

      {tab === 'logs' && (
        <Card className="p-6">
          <h3 className="text-lg text-primary-text mb-4">Admin action log</h3>
          {state.adminLogs.length === 0 ? (
            <p className="text-sm text-secondary-text italic">No actions logged yet.</p>
          ) : (
            <div className="space-y-2">
              {state.adminLogs.map((l) => (
                <div key={l.id} className="flex items-start gap-3 rounded-xl border border-border bg-ivory px-4 py-3 text-sm">
                  <ScrollText size={16} className="text-forest mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-primary-text font-medium">{l.action}</p>
                    <p className="text-secondary-text text-xs mt-0.5">{l.detail}</p>
                  </div>
                  <span className="text-xs text-secondary-text">{new Date(l.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Modal
        open={!!review}
        onClose={() => setReview(null)}
        title={review?.status === 'approved' ? 'Approve request?' : 'Reject request?'}
        size="sm"
        footer={<><Button variant="ghost" onClick={() => setReview(null)}>Cancel</Button><Button variant={review?.status === 'approved' ? 'primary' : 'danger'} onClick={confirmReview}>{review?.status === 'approved' ? 'Approve' : 'Reject'}</Button></>}
      >
        <p className="text-sm text-secondary-text">Request from <span className="font-medium text-primary-text">{review?.request.requesterName}</span> ({review?.request.relationship}).</p>
        <div className="mt-4">
          <Field label="Review note" hint="Recorded in the action log."><Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Identity verified via… / Reason insufficient…" /></Field>
        </div>
        {review?.status === 'approved' && (
          <div className="mt-4 rounded-xl border border-forest/15 bg-forest-50 px-4 py-3 text-xs text-forest/80">Only information the owner explicitly authorized will be released. The contact does not receive blanket access.</div>
        )}
      </Modal>
    </div>
  );
}

function RequestRow({ request, onReview, readOnly }: { request: LegacyRequest; onReview?: (r: LegacyRequest, s: 'approved' | 'rejected') => void; readOnly?: boolean }) {
  const statusMeta = {
    pending: { tone: 'warning' as const, label: 'Pending' },
    approved: { tone: 'success' as const, label: 'Approved' },
    rejected: { tone: 'error' as const, label: 'Rejected' },
  };
  const st = statusMeta[request.status];
  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg text-primary-text">{request.requesterName}</h3>
            <Badge tone={st.tone}>{st.label}</Badge>
            <Badge tone="neutral">{request.relationship}</Badge>
          </div>
          <p className="text-sm text-secondary-text mt-1">{request.requesterEmail}</p>
          <p className="text-sm text-primary-text mt-3 leading-relaxed">{request.reason}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-text">
            <span>Submitted {new Date(request.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {request.reviewedAt && <span>Reviewed {new Date(request.reviewedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
          </div>
          {request.reviewNote && <p className="mt-2 text-xs text-secondary-text pt-2 border-t border-border">Admin note: {request.reviewNote}</p>}
        </div>
        {!readOnly && onReview && (
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" icon={<Eye size={15} />} onClick={() => onReview(request, 'rejected')}>Reject</Button>
            <Button size="sm" icon={<CheckCircle2 size={15} />} onClick={() => onReview(request, 'approved')}>Approve</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
