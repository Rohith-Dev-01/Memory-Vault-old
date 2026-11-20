// Tiny hashing + id helpers (NOT cryptographic — demo-grade prototype)
// Simulates password hashing for the interactive prototype.

import type { AppState, User, UUID } from './types';

const DB_KEY = 'memory_vault_db_v1';
const SESSION_KEY = 'memory_vault_session';
const ADMIN_SESSION_KEY = 'memory_vault_admin_session';

export function uid(prefix = 'id'): UUID {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function hashPassword(password: string): string {
  // Lightweight non-crypto hash for demo only (FNV-1a + salt-ish)
  let h = 2166136261;
  const salt = 'mv$2026';
  const s = salt + password + salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `h$${(h >>> 0).toString(16)}$${s.length}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function token(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

// ---------- DB persistence ----------

export function loadDB(): AppState {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    /* ignore */
  }
  const fresh = seedDB();
  saveDB(fresh);
  return fresh;
}

export function saveDB(state: AppState): void {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
}

// ---------- Session ----------

export function getSessionUserId(): UUID | null {
  return localStorage.getItem(SESSION_KEY) as UUID | null;
}
export function setSessionUserId(id: UUID | null): void {
  if (id) localStorage.setItem(SESSION_KEY, id);
  else localStorage.removeItem(SESSION_KEY);
}

export function getAdminSessionId(): UUID | null {
  return localStorage.getItem(ADMIN_SESSION_KEY) as UUID | null;
}
export function setAdminSessionId(id: UUID | null): void {
  if (id) localStorage.setItem(ADMIN_SESSION_KEY, id);
  else localStorage.removeItem(ADMIN_SESSION_KEY);
}

// ---------- seed data ----------

const DAY = 24 * 60 * 60 * 1000;

function seedDB(): AppState {
  const now = Date.now();

  const demoUserId = uid('usr');
  const demoUser: User = {
    id: demoUserId,
    userId: 'amelia_h',
    fullName: 'Amelia Hartwell',
    email: 'amelia.hartwell@example.com',
    passwordHash: hashPassword('demo1234'),
    createdAt: now - 40 * DAY,
    lastLogin: now - 3 * DAY,
    lastCheckIn: now - 3 * DAY,
    inactivityStart: now - 3 * DAY,
    reminderStage: 0,
    demoMode: false,
  };

  const adminId = uid('adm');
  const admins = [
    { id: adminId, username: 'admin', passwordHash: hashPassword('admin1234') },
  ];

  const assets = [
    { id: uid('ast'), ownerId: demoUserId, name: 'Personal Instagram', platform: 'Instagram', category: 'Social Media' as const, accountIdentifier: '@amelia.hartwell', description: 'Personal photo journal from 2014 onward, thousands of memories.', createdAt: now - 38 * DAY },
    { id: uid('ast'), ownerId: demoUserId, name: 'Family Facebook', platform: 'Facebook', category: 'Social Media' as const, accountIdentifier: 'amelia.hartwell@example.com', description: 'Connected to extended family and old school friends.', createdAt: now - 38 * DAY },
    { id: uid('ast'), ownerId: demoUserId, name: 'Primary Email', platform: 'Gmail', category: 'Email & Communication' as const, accountIdentifier: 'amelia.hartwell@example.com', description: 'Main email — contains accounts, receipts and correspondence.', createdAt: now - 38 * DAY },
    { id: uid('ast'), ownerId: demoUserId, name: 'Cloud Photos Library', platform: 'Google Photos', category: 'Photos & Media' as const, accountIdentifier: 'amelia.hartwell@gmail.com', description: '20,000+ photos spanning a decade of family life.', createdAt: now - 36 * DAY },
    { id: uid('ast'), ownerId: demoUserId, name: 'Documents Drive', platform: 'Google Drive', category: 'Cloud Storage' as const, accountIdentifier: 'amelia.hartwell@gmail.com', description: 'Wills, certificates, scans, and personal writing.', createdAt: now - 36 * DAY },
    { id: uid('ast'), ownerId: demoUserId, name: 'Music Streaming', platform: 'Spotify', category: 'Subscriptions' as const, accountIdentifier: 'amelia_h', description: 'Curated playlists built over many years.', createdAt: now - 30 * DAY },
  ];

  const assetId = (i: number) => assets[i].id;
  const wishes = [
    { id: uid('wsh'), ownerId: demoUserId, assetId: assetId(0), action: 'preserve_memories' as const, instructions: 'Please save my travel and family photo highlights as a downloadable archive for my sister.', createdAt: now - 35 * DAY },
    { id: uid('wsh'), ownerId: demoUserId, assetId: assetId(1), action: 'memorialization' as const, instructions: 'Request Facebook memorialization so friends can still visit and remember.', createdAt: now - 35 * DAY },
    { id: uid('wsh'), ownerId: demoUserId, assetId: assetId(2), action: 'share_selected' as const, instructions: 'Share only finance-related correspondence with my spouse; delete everything else per provider process.', createdAt: now - 34 * DAY },
    { id: uid('wsh'), ownerId: demoUserId, assetId: assetId(3), action: 'preserve_memories' as const, instructions: 'Create a shared family album of the first five years of my children.', createdAt: now - 34 * DAY },
    { id: uid('wsh'), ownerId: demoUserId, assetId: assetId(4), action: 'preserve_account' as const, instructions: 'Download all documents and hand a USB copy to my brother Daniel.', createdAt: now - 33 * DAY },
    { id: uid('wsh'), ownerId: demoUserId, assetId: assetId(5), action: 'request_deletion' as const, instructions: 'Cancel the subscription. No need to keep the playlists.', createdAt: now - 30 * DAY },
  ];

  const contacts = [
    { id: uid('ctc'), ownerId: demoUserId, name: 'Daniel Hartwell', email: 'daniel.hartwell@example.com', phone: '+1 555 0142', relationship: 'Brother', invitationToken: token(), invitationStatus: 'accepted' as const, createdAt: now - 37 * DAY },
    { id: uid('ctc'), ownerId: demoUserId, name: 'Sophie Hartwell', email: 'sophie.hartwell@example.com', phone: '+1 555 0177', relationship: 'Spouse', invitationToken: token(), invitationStatus: 'accepted' as const, createdAt: now - 37 * DAY },
    { id: uid('ctc'), ownerId: demoUserId, name: 'Dr. Marcus Lee', email: 'marcus.lee@example.com', phone: '+1 555 0190', relationship: 'Close Friend', invitationToken: token(), invitationStatus: 'pending' as const, createdAt: now - 10 * DAY },
  ];

  const memories = [
    { id: uid('mem'), ownerId: demoUserId, title: 'For Sophie, on our anniversary', message: 'My love, if you are reading this it means I could not say it in person. Every quiet morning with you was the best part of my life. Take the children to Lisbon one spring — the light there is how I remember you smiling. Be happy. — A.', recipient: 'Sophie Hartwell', createdAt: now - 32 * DAY },
    { id: uid('mem'), ownerId: demoUserId, title: 'A note for my children', message: 'To Maya and Theo: You made me braver than I ever thought I could be. Be kind to each other, keep the garden going, and remember that failure is just practice in disguise. I am proud of you both, always.', recipient: 'Maya & Theo Hartwell', createdAt: now - 28 * DAY },
    { id: uid('mem'), ownerId: demoUserId, title: 'To my brother Daniel', message: 'Dan — thanks for being the steady one. Look after Mum, and don\'t let anyone sell the house without going through the paperwork in my Drive. The good scotch is in the bottom drawer. Share it.', recipient: 'Daniel Hartwell', createdAt: now - 20 * DAY },
  ];

  const requests = [
    { id: uid('req'), contactId: contacts[0].id, ownerId: demoUserId, requesterName: 'Daniel Hartwell', requesterEmail: 'daniel.hartwell@example.com', relationship: 'Brother', reason: 'I have not heard from Amelia in over a month and her phone is off. I would like to retrieve the family photos she trusted me with.', status: 'pending' as const, reviewNote: '', createdAt: now - 2 * DAY, reviewedAt: null },
  ];

  return {
    users: [demoUser],
    digitalAssets: assets,
    finalWishes: wishes,
    trustedContacts: contacts,
    memories,
    legacyRequests: requests,
    notificationLogs: [],
    adminLogs: [],
    admins,
  };
}
