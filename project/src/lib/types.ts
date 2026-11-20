// Core domain types for Memory Vault

export type UUID = string;

export type AssetCategory =
  | 'Social Media'
  | 'Email & Communication'
  | 'Cloud Storage'
  | 'Photos & Media'
  | 'Subscriptions'
  | 'Finance & Banking'
  | 'Other';

export interface User {
  id: UUID;
  userId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  lastLogin: number;
  lastCheckIn: number;
  inactivityStart: number; // epoch ms when inactivity clock last reset
  reminderStage: number; // 0..4 (0=none, 1=day30, 2=day35, 3=day40, 4=day45 contacts)
  demoMode: boolean;
}

export interface DigitalAsset {
  id: UUID;
  ownerId: UUID;
  name: string;
  platform: string;
  category: AssetCategory;
  accountIdentifier: string;
  description: string;
  createdAt: number;
}

export type WishAction =
  | 'preserve_account'
  | 'preserve_memories'
  | 'share_selected'
  | 'memorialization'
  | 'request_deletion';

export interface FinalWish {
  id: UUID;
  ownerId: UUID;
  assetId: UUID | null;
  action: WishAction;
  instructions: string;
  createdAt: number;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export interface TrustedContact {
  id: UUID;
  ownerId: UUID;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  invitationToken: string;
  invitationStatus: InvitationStatus;
  createdAt: number;
}

export interface Memory {
  id: UUID;
  ownerId: UUID;
  title: string;
  message: string;
  recipient: string;
  createdAt: number;
}

export interface LegacyRequest {
  id: UUID;
  contactId: UUID;
  ownerId: UUID;
  requesterName: string;
  requesterEmail: string;
  relationship: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote: string;
  createdAt: number;
  reviewedAt: number | null;
}

export type NotificationType =
  | 'reminder_1'
  | 'reminder_2'
  | 'reminder_3'
  | 'contact_alert';

export interface NotificationLog {
  id: UUID;
  ownerId: UUID;
  type: NotificationType;
  message: string;
  sentAt: number;
}

export interface AdminActionLog {
  id: UUID;
  adminId: UUID;
  action: string;
  detail: string;
  at: number;
}

export interface AdminUser {
  id: UUID;
  username: string;
  passwordHash: string;
}

export interface AppState {
  users: User[];
  digitalAssets: DigitalAsset[];
  finalWishes: FinalWish[];
  trustedContacts: TrustedContact[];
  memories: Memory[];
  legacyRequests: LegacyRequest[];
  notificationLogs: NotificationLog[];
  adminLogs: AdminActionLog[];
  admins: AdminUser[];
}
