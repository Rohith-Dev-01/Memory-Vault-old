import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AdminActionLog,
  AppState,
  DigitalAsset,
  FinalWish,
  LegacyRequest,
  Memory,
  NotificationLog,
  TrustedContact,
  User,
} from './types';
import {
  getAdminSessionId,
  getSessionUserId,
  hashPassword,
  loadDB,
  saveDB,
  setAdminSessionId,
  setSessionUserId,
  token,
  uid,
  verifyPassword,
} from './store';
import { resetInactivity, runMonitoringTick } from './monitoring';

interface Toast {
  id: string;
  kind: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextValue {
  state: AppState;
  currentUser: User | null;
  currentAdmin: AppState['admins'][number] | null;
  toasts: Toast[];

  // auth
  register: (data: { userId: string; fullName: string; email: string; password: string }) => { ok: boolean; error?: string };
  login: (identifier: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  adminLogin: (username: string, password: string) => { ok: boolean; error?: string };
  adminLogout: () => void;
  checkIn: () => void;

  // assets
  addAsset: (a: Omit<DigitalAsset, 'id' | 'ownerId' | 'createdAt'>) => void;
  updateAsset: (id: string, patch: Partial<DigitalAsset>) => void;
  deleteAsset: (id: string) => void;

  // wishes
  addWish: (w: Omit<FinalWish, 'id' | 'ownerId' | 'createdAt'>) => void;
  updateWish: (id: string, patch: Partial<FinalWish>) => void;
  deleteWish: (id: string) => void;

  // contacts
  addContact: (c: Omit<TrustedContact, 'id' | 'ownerId' | 'createdAt' | 'invitationToken' | 'invitationStatus'>) => TrustedContact | null;
  updateContact: (id: string, patch: Partial<TrustedContact>) => void;
  deleteContact: (id: string) => void;
  sendInvitation: (id: string) => void;

  // memories
  addMemory: (m: Omit<Memory, 'id' | 'ownerId' | 'createdAt'>) => void;
  updateMemory: (id: string, patch: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;

  // legacy requests
  submitLegacyRequest: (data: { contactId: string; reason: string }) => { ok: boolean; error?: string };
  reviewRequest: (id: string, status: 'approved' | 'rejected', note: string) => void;

  // monitoring demo
  simulateStage: (stageIndex: number) => void;

  // toasts
  notify: (kind: Toast['kind'], message: string) => void;
  dismissToast: (id: string) => void;

  // admin logs
  appendAdminLog: (action: string, detail: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadDB());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => getSessionUserId());
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(() => getAdminSessionId());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const tickRan = useRef<Set<string>>(new Set());

  // persist on change
  useEffect(() => {
    saveDB(state);
  }, [state]);

  const currentUser = useMemo(
    () => state.users.find((u) => u.id === currentUserId) ?? null,
    [state.users, currentUserId]
  );
  const currentAdmin = useMemo(
    () => state.admins.find((a) => a.id === currentAdminId) ?? null,
    [state.admins, currentAdminId]
  );

  const notify = useCallback((kind: Toast['kind'], message: string) => {
    const id = uid('tst');
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // Run monitoring tick whenever current user changes or state refreshes.
  useEffect(() => {
    if (!currentUserId) return;
    setState((prev) => {
      const { user, newNotifications } = runMonitoringTick(prev, currentUserId);
      if (newNotifications.length === 0 && user.reminderStage === prev.users.find((u) => u.id === currentUserId)?.reminderStage) {
        return prev;
      }
      const users = prev.users.map((u) => (u.id === currentUserId ? user : u));
      const logs = [...prev.notificationLogs, ...newNotifications];
      newNotifications.forEach((n) => {
        const title = n.type === 'contact_alert' ? 'Trusted contacts notified' : 'Inactivity reminder sent';
        setTimeout(() => notify('info', `${title}: ${n.message.slice(0, 80)}…`), 50);
      });
      return { ...prev, users, notificationLogs: logs };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ---- Auth ----
  const register: AppContextValue['register'] = useCallback(({ userId, fullName, email, password }) => {
    const exists = state.users.some(
      (u) => u.userId.toLowerCase() === userId.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) return { ok: false, error: 'An account with this user ID or email already exists.' };
    const now = Date.now();
    const user: User = {
      id: uid('usr'),
      userId,
      fullName,
      email,
      passwordHash: hashPassword(password),
      createdAt: now,
      lastLogin: now,
      lastCheckIn: now,
      inactivityStart: now,
      reminderStage: 0,
      demoMode: false,
    };
    setState((prev) => ({ ...prev, users: [...prev.users, user] }));
    setSessionUserId(user.id);
    setCurrentUserId(user.id);
    return { ok: true };
  }, [state.users]);

  const login: AppContextValue['login'] = useCallback((identifier, password) => {
    const u = state.users.find(
      (x) => x.email.toLowerCase() === identifier.toLowerCase() || x.userId.toLowerCase() === identifier.toLowerCase()
    );
    if (!u || !verifyPassword(password, u.passwordHash)) {
      return { ok: false, error: 'Invalid credentials. Please check your email/user ID and password.' };
    }
    const reset = resetInactivity(u);
    setState((prev) => ({ ...prev, users: prev.users.map((x) => (x.id === u.id ? reset : x)) }));
    setSessionUserId(u.id);
    setCurrentUserId(u.id);
    return { ok: true };
  }, [state.users]);

  const logout = useCallback(() => {
    setSessionUserId(null);
    setCurrentUserId(null);
  }, []);

  const adminLogin: AppContextValue['adminLogin'] = useCallback((username, password) => {
    const a = state.admins.find((x) => x.username.toLowerCase() === username.toLowerCase());
    if (!a || !verifyPassword(password, a.passwordHash)) {
      return { ok: false, error: 'Invalid admin credentials.' };
    }
    setAdminSessionId(a.id);
    setCurrentAdminId(a.id);
    return { ok: true };
  }, [state.admins]);

  const adminLogout = useCallback(() => {
    setAdminSessionId(null);
    setCurrentAdminId(null);
  }, []);

  const checkIn = useCallback(() => {
    if (!currentUserId) return;
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === currentUserId ? resetInactivity(u) : u)),
    }));
    notify('success', 'Check-in recorded. Your inactivity reminder cycle has been reset.');
  }, [currentUserId, notify]);

  // ---- Assets ----
  const addAsset: AppContextValue['addAsset'] = useCallback((a) => {
    if (!currentUserId) return;
    const asset: DigitalAsset = { ...a, id: uid('ast'), ownerId: currentUserId, createdAt: Date.now() };
    setState((prev) => ({ ...prev, digitalAssets: [asset, ...prev.digitalAssets] }));
    notify('success', `“${a.name}” added to your digital assets.`);
  }, [currentUserId, notify]);

  const updateAsset: AppContextValue['updateAsset'] = useCallback((id, patch) => {
    setState((prev) => ({ ...prev, digitalAssets: prev.digitalAssets.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
    notify('success', 'Asset updated.');
  }, [notify]);

  const deleteAsset: AppContextValue['deleteAsset'] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      digitalAssets: prev.digitalAssets.filter((x) => x.id !== id),
      finalWishes: prev.finalWishes.filter((w) => w.assetId !== id),
    }));
    notify('info', 'Asset and its linked final wish removed.');
  }, [notify]);

  // ---- Wishes ----
  const addWish: AppContextValue['addWish'] = useCallback((w) => {
    if (!currentUserId) return;
    const wish: FinalWish = { ...w, id: uid('wsh'), ownerId: currentUserId, createdAt: Date.now() };
    setState((prev) => ({ ...prev, finalWishes: [wish, ...prev.finalWishes] }));
    notify('success', 'Final wish recorded.');
  }, [currentUserId, notify]);

  const updateWish: AppContextValue['updateWish'] = useCallback((id, patch) => {
    setState((prev) => ({ ...prev, finalWishes: prev.finalWishes.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
    notify('success', 'Final wish updated.');
  }, [notify]);

  const deleteWish: AppContextValue['deleteWish'] = useCallback((id) => {
    setState((prev) => ({ ...prev, finalWishes: prev.finalWishes.filter((x) => x.id !== id) }));
    notify('info', 'Final wish removed.');
  }, [notify]);

  // ---- Contacts ----
  const addContact: AppContextValue['addContact'] = useCallback((c) => {
    if (!currentUserId) return null;
    const contact: TrustedContact = {
      ...c, id: uid('ctc'), ownerId: currentUserId, createdAt: Date.now(),
      invitationToken: token(), invitationStatus: 'pending',
    };
    setState((prev) => ({ ...prev, trustedContacts: [contact, ...prev.trustedContacts] }));
    notify('success', `Invitation prepared for ${c.name}.`);
    return contact;
  }, [currentUserId, notify]);

  const updateContact: AppContextValue['updateContact'] = useCallback((id, patch) => {
    setState((prev) => ({ ...prev, trustedContacts: prev.trustedContacts.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
    notify('success', 'Contact updated.');
  }, [notify]);

  const deleteContact: AppContextValue['deleteContact'] = useCallback((id) => {
    setState((prev) => ({ ...prev, trustedContacts: prev.trustedContacts.filter((x) => x.id !== id) }));
    notify('info', 'Trusted contact removed.');
  }, [notify]);

  const sendInvitation: AppContextValue['sendInvitation'] = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      trustedContacts: prev.trustedContacts.map((x) =>
        x.id === id ? { ...x, invitationStatus: 'pending' } : x
      ),
    }));
    notify('success', 'Invitation email sent (simulated). Status: Pending.');
  }, [notify]);

  // ---- Memories ----
  const addMemory: AppContextValue['addMemory'] = useCallback((m) => {
    if (!currentUserId) return;
    const mem: Memory = { ...m, id: uid('mem'), ownerId: currentUserId, createdAt: Date.now() };
    setState((prev) => ({ ...prev, memories: [mem, ...prev.memories] }));
    notify('success', `“${m.title}” saved to your memories.`);
  }, [currentUserId, notify]);

  const updateMemory: AppContextValue['updateMemory'] = useCallback((id, patch) => {
    setState((prev) => ({ ...prev, memories: prev.memories.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
    notify('success', 'Memory updated.');
  }, [notify]);

  const deleteMemory: AppContextValue['deleteMemory'] = useCallback((id) => {
    setState((prev) => ({ ...prev, memories: prev.memories.filter((x) => x.id !== id) }));
    notify('info', 'Memory removed.');
  }, [notify]);

  // ---- Legacy requests ----
  const submitLegacyRequest: AppContextValue['submitLegacyRequest'] = useCallback(({ contactId, reason }) => {
    const contact = state.trustedContacts.find((c) => c.id === contactId);
    if (!contact) return { ok: false, error: 'Contact not found.' };
    if (contact.invitationStatus !== 'accepted') {
      return { ok: false, error: 'Only contacts who accepted your invitation can submit a request.' };
    }
    const req: LegacyRequest = {
      id: uid('req'),
      contactId,
      ownerId: contact.ownerId,
      requesterName: contact.name,
      requesterEmail: contact.email,
      relationship: contact.relationship,
      reason,
      status: 'pending',
      reviewNote: '',
      createdAt: Date.now(),
      reviewedAt: null,
    };
    setState((prev) => ({ ...prev, legacyRequests: [req, ...prev.legacyRequests] }));
    return { ok: true };
  }, [state.trustedContacts]);

  const reviewRequest: AppContextValue['reviewRequest'] = useCallback((id, status, note) => {
    if (!currentAdminId) return;
    setState((prev) => ({
      ...prev,
      legacyRequests: prev.legacyRequests.map((r) =>
        r.id === id ? { ...r, status, reviewNote: note, reviewedAt: Date.now() } : r
      ),
      adminLogs: [
        {
          id: uid('log'),
          adminId: currentAdminId,
          action: status === 'approved' ? 'Request approved' : 'Request rejected',
          detail: `Request ${id} — ${note || 'no note'}`,
          at: Date.now(),
        },
        ...prev.adminLogs,
      ],
    }));
    notify('success', `Request ${status}.`);
  }, [currentAdminId, notify]);

  // ---- Monitoring simulation ----
  const simulateStage: AppContextValue['simulateStage'] = useCallback((stageIndex) => {
    if (!currentUserId) return;
    setState((prev) => {
      const u = prev.users.find((x) => x.id === currentUserId);
      if (!u) return prev;
      const moved = stageIndex === 0
        ? resetInactivity(u)
        : { ...u, inactivityStart: Date.now() - ([0, 30, 35, 40, 45][stageIndex] ?? 0) * 86400000, reminderStage: 0, demoMode: true };
      return { ...prev, users: prev.users.map((x) => (x.id === currentUserId ? moved : x)) };
    });
    const labels = ['Active (checked in)', 'Day 30 — first reminder', 'Day 35 — second reminder', 'Day 40 — final reminder', 'Day 45 — contacts notified'];
    notify('info', `Demo simulation set to: ${labels[stageIndex]}`);
    // run a tick shortly after to emit notifications
    setTimeout(() => {
      setState((prev) => {
        const { user, newNotifications } = runMonitoringTick(prev, currentUserId);
        if (newNotifications.length === 0) return prev;
        newNotifications.forEach((n) => notify('info', `Notification: ${n.message.slice(0, 90)}…`));
        return {
          ...prev,
          users: prev.users.map((x) => (x.id === currentUserId ? user : x)),
          notificationLogs: [...prev.notificationLogs, ...newNotifications],
        };
      });
    }, 200);
  }, [currentUserId, notify]);

  const appendAdminLog: AppContextValue['appendAdminLog'] = useCallback((action, detail) => {
    if (!currentAdminId) return;
    const log: AdminActionLog = { id: uid('log'), adminId: currentAdminId, action, detail, at: Date.now() };
    setState((prev) => ({ ...prev, adminLogs: [log, ...prev.adminLogs] }));
  }, [currentAdminId]);

  const value: AppContextValue = {
    state, currentUser, currentAdmin, toasts,
    register, login, logout, adminLogin, adminLogout, checkIn,
    addAsset, updateAsset, deleteAsset,
    addWish, updateWish, deleteWish,
    addContact, updateContact, deleteContact, sendInvitation,
    addMemory, updateMemory, deleteMemory,
    submitLegacyRequest, reviewRequest,
    simulateStage,
    notify, dismissToast,
    appendAdminLog,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export type { Toast };
