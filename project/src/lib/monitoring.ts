// Inactivity monitoring engine for Memory Vault prototype.
// In real life this runs as a cron job on the server; here it is a
// deterministic function of the inactivity clock + demo simulation.

import type { AppState, NotificationType, User } from './types';
import { uid } from './store';

export const DAY = 24 * 60 * 60 * 1000;

export const STAGES = [
  { day: 30, type: 'reminder_1' as NotificationType, title: 'First reminder', message: 'We noticed you have not checked in to Memory Vault recently. This is a gentle reminder that your legacy plan is still active.' },
  { day: 35, type: 'reminder_2' as NotificationType, title: 'Second reminder', message: 'This is your second inactivity reminder. Please log in to Memory Vault to confirm you are well and reset the reminder cycle.' },
  { day: 40, type: 'reminder_3' as NotificationType, title: 'Final reminder', message: 'Final reminder: if we do not hear from you soon, Memory Vault will notify your trusted contacts so they can check on your wellbeing.' },
  { day: 45, type: 'contact_alert' as NotificationType, title: 'Trusted contacts notified', message: 'Because the inactivity window has elapsed, your trusted contacts have been invited to check on you. No private data has been released.' },
];

export function daysInactive(user: User, now = Date.now()): number {
  return Math.floor((now - user.inactivityStart) / DAY);
}

export function nextStage(user: User, now = Date.now()) {
  const d = daysInactive(user, now);
  const upcoming = STAGES.find((s) => s.day > d) ?? null;
  const nextReminderDate = upcoming
    ? new Date(user.inactivityStart + upcoming.day * DAY)
    : null;
  return { upcoming, nextReminderDate, daysInactive: d };
}

export function completionPercentage(state: AppState, userId: string): number {
  const assets = state.digitalAssets.filter((a) => a.ownerId === userId);
  const wishes = state.finalWishes.filter((w) => w.ownerId === userId);
  const contacts = state.trustedContacts.filter((c) => c.ownerId === userId);
  const memories = state.memories.filter((m) => m.ownerId === userId);

  let score = 0;
  if (assets.length > 0) score += 25;
  if (contacts.length >= 1) score += 20;
  else if (contacts.length > 0) score += 10;
  if (memories.length > 0) score += 25;
  if (wishes.length >= assets.length && assets.length > 0) score += 30;
  else if (wishes.length > 0) score += 15;

  return Math.min(100, score);
}

// Runs the "cron" tick for a single user — emits notifications it should
// have already received, without ever duplicating a stage. Returns the
// updated user and any new notifications appended.
export function runMonitoringTick(state: AppState, userId: string, now = Date.now()): {
  user: User;
  newNotifications: AppState['notificationLogs'];
} {
  const user = state.users.find((u) => u.id === userId);
  if (!user) return { user: user as never, newNotifications: [] };

  const d = daysInactive(user, now);
  let newStage = user.reminderStage;
  const newNotifications: AppState['notificationLogs'] = [];

  for (const stage of STAGES) {
    const stageIndex = STAGES.indexOf(stage) + 1;
    if (d >= stage.day && user.reminderStage < stageIndex) {
      // ensure not already logged (prevent duplicates)
      const exists = state.notificationLogs.some(
        (n) => n.ownerId === userId && n.type === stage.type && n.sentAt >= user.inactivityStart
      );
      if (!exists) {
        newNotifications.push({
          id: uid('ntf'),
          ownerId: userId,
          type: stage.type,
          message: stage.message,
          sentAt: user.inactivityStart + stage.day * DAY,
        });
        if (stageIndex > newStage) newStage = stageIndex;
      }
    }
  }

  return { user: { ...user, reminderStage: newStage }, newNotifications };
}

// Reset inactivity clock (login or manual check-in)
export function resetInactivity(user: User): User {
  return { ...user, inactivityStart: Date.now(), reminderStage: 0, lastCheckIn: Date.now(), lastLogin: Date.now() };
}

// Demo simulation: jump the inactivity clock forward to demonstrate a stage.
export function simulateInactivity(user: User, targetStageIndex: number): User {
  // targetStageIndex: 0 = active, 1 = day 30, 2 = day 35, 3 = day 40, 4 = day 45+
  if (targetStageIndex === 0) {
    return resetInactivity(user);
  }
  const day = STAGES[targetStageIndex - 1].day;
  return {
    ...user,
    inactivityStart: Date.now() - day * DAY,
    reminderStage: targetStageIndex - 1, // about to be advanced by tick
    demoMode: true,
  };
}
