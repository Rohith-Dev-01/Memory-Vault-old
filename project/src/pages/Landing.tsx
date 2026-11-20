import {
  FolderLock, HeartHandshake, Users, BookHeart, ShieldCheck,
  BellRing, FileText, ArrowRight, CheckCircle2, Lock, Mail, Eye, EyeOff,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import Button from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';

const features = [
  { icon: FolderLock, title: 'Digital Asset Registry', text: 'Catalog every online account — social, cloud, email, subscriptions — without ever storing passwords.' },
  { icon: HeartHandshake, title: 'Final Wishes', text: 'Leave clear instructions for each asset: preserve, memorialize, share, or request deletion.' },
  { icon: Users, title: 'Trusted Contacts', text: 'Nominate people you trust. Invitations stay pending until accepted — no private data is exposed.' },
  { icon: BookHeart, title: 'Memories & Letters', text: 'Write letters to the people you love. They will be there when it matters most.' },
  { icon: BellRing, title: 'Inactivity Monitoring', text: 'A gentle 30/35/40-day reminder cycle. Only after 45 days do trusted contacts get a wellbeing check-in prompt.' },
  { icon: ShieldCheck, title: 'Authorized Legacy Access', text: 'Every release is reviewed by an administrator. Inactivity is never treated as proof of loss.' },
];

export default function Landing({ onNavigate }: { onNavigate: (r: 'register' | 'login') => void }) {
  return (
    <div className="min-h-screen bg-ivory-texture">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-ivory/85 backdrop-blur-md border-b border-border/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-ivory font-display text-lg">M</div>
            <div>
              <p className="font-display text-lg text-primary-text leading-none">Memory Vault</p>
              <p className="text-[10px] text-secondary-text tracking-wide mt-0.5">Digital Legacy Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onNavigate('login')}>Sign in</Button>
            <Button size="sm" onClick={() => onNavigate('register')} icon={<ArrowRight size={15} />}>Get started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-16 lg:pt-24 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-forest bg-forest-50 border border-forest/15 px-3 py-1.5 rounded-full">
              <Lock size={13} /> Private. Secure. Enduring.
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl text-primary-text leading-[1.05] font-display">
              Your memories deserve <span className="italic text-terracotta">to live on.</span>
            </h1>
            <p className="mt-6 text-lg text-secondary-text max-w-xl leading-relaxed">
              Memory Vault helps you organize your digital life, record your final wishes, and leave letters for the people you love — so that what matters most is never lost.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => onNavigate('register')} icon={<ArrowRight size={18} />}>Create your vault</Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate('login')}>I already have an account</Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-secondary-text">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-success" /> No passwords stored</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-success" /> Admin-reviewed access</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-success" /> Print-ready legacy summary</span>
            </div>
          </div>

          {/* Decorative panel */}
          <div className="relative animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="relative rounded-3xl border border-border bg-white shadow-lift overflow-hidden">
              {/* Faux legacy summary card */}
              <div className="bg-forest px-7 py-6 text-ivory">
                <p className="text-xs uppercase tracking-[0.18em] text-ivory/60">Legacy Plan</p>
                <p className="font-display text-2xl mt-1">Amelia Hartwell</p>
                <p className="text-sm text-ivory/70 mt-1">Completion · 78%</p>
                <div className="mt-3 h-1.5 rounded-full bg-ivory/20 overflow-hidden">
                  <div className="h-full bg-terracotta rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
              <div className="p-7 space-y-4">
                {[
                  { icon: FolderLock, label: 'Digital assets', value: '6 cataloged' },
                  { icon: HeartHandshake, label: 'Final wishes', value: '6 instructions' },
                  { icon: Users, label: 'Trusted contacts', value: '2 accepted · 1 pending' },
                  { icon: BookHeart, label: 'Letters saved', value: '3 for loved ones' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sand flex items-center justify-center text-forest"><r.icon size={17} /></div>
                      <span className="text-sm text-primary-text">{r.label}</span>
                    </div>
                    <span className="text-sm text-secondary-text">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="px-7 pb-7">
                <div className="rounded-xl bg-forest-50 border border-forest/10 px-4 py-3 flex items-center gap-3">
                  <BellRing size={17} className="text-forest" />
                  <p className="text-xs text-forest/80">Last check-in 3 days ago · No reminders sent</p>
                </div>
              </div>
            </div>
            {/* floating accent */}
            <div className="hidden lg:block absolute -top-6 -right-6 w-28 h-28 rounded-2xl bg-terracotta/15 -z-10" />
            <div className="hidden lg:block absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-forest/10 -z-10" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-secondary-text mb-3">Everything in one place</p>
            <h2 className="text-3xl lg:text-4xl text-primary-text">A complete plan for your digital legacy</h2>
            <p className="mt-4 text-secondary-text">Six thoughtful modules that work together to make sure your wishes are clear, your people are informed, and your memories are protected.</p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-ivory p-6 transition-all duration-300 hover:shadow-lift hover:-translate-y-1 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-forest text-ivory flex items-center justify-center group-hover:bg-terracotta transition-colors">
                  <f.icon size={22} />
                </div>
                <h3 className="mt-5 text-xl text-primary-text">{f.title}</h3>
                <p className="mt-2 text-sm text-secondary-text leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ivory-texture border-t border-border/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { n: '01', t: 'Catalog your digital life', d: 'Add your accounts and assets. Describe what they contain and why they matter — no passwords, ever.' },
              { n: '02', t: 'Record your wishes', d: 'For each asset, choose what should happen: preserve, memorialize, share with someone, or request deletion.' },
              { n: '03', t: 'Choose your people', d: 'Invite trusted contacts and write letters. Memory Vault checks in with you regularly — and only notifies them if you go quiet.' },
            ].map((s) => (
              <div key={s.n}>
                <p className="font-display text-5xl text-terracotta/40">{s.n}</p>
                <h3 className="mt-3 text-xl text-primary-text">{s.t}</h3>
                <p className="mt-2 text-sm text-secondary-text leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest text-ivory">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 py-20 text-center">
          <FileText className="mx-auto text-terracotta" size={36} />
          <h2 className="mt-5 text-3xl lg:text-4xl">Begin your legacy today</h2>
          <p className="mt-4 text-ivory/70 max-w-xl mx-auto">It takes only a few minutes to set up your vault. The people who matter will thank you for it.</p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" onClick={() => onNavigate('register')} icon={<ArrowRight size={18} />}>Create your vault</Button>
          </div>
        </div>
      </section>

      <footer className="bg-forest-600 text-ivory/70 py-8 text-center text-sm">
        <p>Memory Vault — A Digital Legacy Management prototype. Built for demonstration purposes.</p>
      </footer>
    </div>
  );
}

// ---------- Auth pages ----------

export function RegisterPage({ onNavigate, onSuccess }: { onNavigate: (r: 'login') => void; onSuccess: () => void }) {
  const { register, notify } = useApp();
  const [form, setForm] = useState({ userId: '', fullName: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.userId.trim()) errs.userId = 'Choose a user ID.';
    else if (form.userId.length < 3) errs.userId = 'At least 3 characters.';
    if (!form.fullName.trim()) errs.fullName = 'Your full name is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 8) errs.password = 'At least 8 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const res = register(form);
    if (!res.ok) { setErrors({ email: res.error ?? 'Registration failed.' }); return; }
    notify('success', 'Welcome to Memory Vault. Your vault is ready.');
    onSuccess();
  };

  return (
    <AuthShell title="Create your vault" subtitle="Set up your account in less than a minute.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="User ID" required error={errors.userId}>
            <Input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} placeholder="e.g. amelia_h" autoCapitalize="none" />
          </Field>
          <Field label="Full name" required error={errors.fullName}>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Amelia Hartwell" />
          </Field>
        </div>
        <Field label="Email" required error={errors.email}>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Password" required error={errors.password} hint="Minimum 8 characters.">
            <div className="relative">
              <Input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="pr-10" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </Field>
          <Field label="Confirm password" required error={errors.confirm}>
            <Input type={show ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" />
          </Field>
        </div>
        <Button full size="lg" type="submit">Create vault</Button>
        <p className="text-sm text-center text-secondary-text">
          Already have an account?{' '}
          <button type="button" onClick={() => onNavigate('login')} className="text-forest font-medium hover:underline">Sign in</button>
        </p>
      </form>
    </AuthShell>
  );
}

export function LoginPage({ onNavigate, onSuccess }: { onNavigate: (r: 'register') => void; onSuccess: () => void }) {
  const { login, notify } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) { setError('Please fill in both fields.'); return; }
    const res = login(identifier, password);
    if (!res.ok) { setError(res.error ?? 'Login failed.'); return; }
    notify('success', 'Welcome back. Inactivity cycle reset.');
    onSuccess();
  };

  const demo = () => {
    setIdentifier('amelia.hartwell@example.com');
    setPassword('demo1234');
    setError('');
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your vault.">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error flex items-center gap-2"><Mail size={16} /> {error}</div>}
        <Field label="Email or User ID" required>
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="amelia.hartwell@example.com" />
        </Field>
        <Field label="Password" required>
          <div className="relative">
            <Input type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
        </Field>
        <Button full size="lg" type="submit">Sign in</Button>
        <button type="button" onClick={demo} className="w-full text-sm text-secondary-text hover:text-forest transition-colors text-center">
          Use demo account — <span className="font-medium">amelia.hartwell@example.com / demo1234</span>
        </button>
        <p className="text-sm text-center text-secondary-text">
          New here?{' '}
          <button type="button" onClick={() => onNavigate('register')} className="text-forest font-medium hover:underline">Create a vault</button>
        </p>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ivory-texture">
      {/* Left visual */}
      <div className="hidden lg:flex relative bg-forest text-ivory p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #F5F1E8 1px, transparent 1px), radial-gradient(circle at 70% 70%, #C77C61 1px, transparent 1px)', backgroundSize: '40px 40px, 60px 60px' }} />
        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-ivory text-forest flex items-center justify-center font-display text-xl">M</div>
            <div>
              <p className="font-display text-xl leading-none">Memory Vault</p>
              <p className="text-[11px] text-ivory/60 tracking-wide mt-0.5">Digital Legacy Management</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <p className="font-display text-4xl leading-tight">
            Your memories<br />deserve <span className="italic text-terracotta">to live on.</span>
          </p>
          <p className="mt-4 text-ivory/70 max-w-md">Plan your digital legacy with clarity and care — for the people who matter most.</p>
          <div className="mt-8 flex gap-6 text-sm">
            <div><p className="font-display text-2xl text-terracotta">6</p><p className="text-ivory/60 text-xs">modules</p></div>
            <div><p className="font-display text-2xl text-terracotta">45d</p><p className="text-ivory/60 text-xs">reminder cycle</p></div>
            <div><p className="font-display text-2xl text-terracotta">0</p><p className="text-ivory/60 text-xs">passwords stored</p></div>
          </div>
        </div>
        <p className="relative text-xs text-ivory/40">A demonstration prototype. Not a substitute for legal advice.</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest text-ivory flex items-center justify-center font-display text-xl">M</div>
            <p className="font-display text-xl text-primary-text">Memory Vault</p>
          </div>
          <h1 className="text-3xl text-primary-text">{title}</h1>
          <p className="text-secondary-text mt-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
