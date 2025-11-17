import type { ApplicationStatus } from '@/types/application';

type StatusKey = ApplicationStatus | 'interview' | 'follow_up' | 'offer_pending' | 'unknown';

interface StatusVisual {
  label: string;
  icon: string;
  textClass: string;
  bgClass: string;
}

const BASE_BADGE_CLASSES =
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition';

export const STATUS_UI: Record<StatusKey, StatusVisual> = {
  applied: {
    label: 'Application',
    icon: '✅',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/15 dark:bg-emerald-500/10',
  },
  screening: {
    label: 'Screening',
    icon: '🗂️',
    textClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-500/15 dark:bg-sky-500/10',
  },
  interviewing: {
    label: 'Interviewing',
    icon: '📞',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/15 dark:bg-blue-500/10',
  },
  interview_scheduled: {
    label: 'Interview Scheduled',
    icon: '📅',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/15 dark:bg-blue-500/10',
  },
  interview_completed: {
    label: 'Interview Completed',
    icon: '📝',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/15 dark:bg-blue-500/10',
  },
  offer: {
    label: 'Offer',
    icon: '🎉',
    textClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-500/15 dark:bg-purple-500/10',
  },
  offer_received: {
    label: 'Offer Received',
    icon: '🎉',
    textClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-500/15 dark:bg-purple-500/10',
  },
  accepted: {
    label: 'Accepted',
    icon: '🏁',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-500/15 dark:bg-indigo-500/10',
  },
  rejected: {
    label: 'Rejection',
    icon: '❌',
    textClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-500/15 dark:bg-rose-500/10',
  },
  withdrawn: {
    label: 'Withdrawn',
    icon: '↩︎',
    textClass: 'text-zinc-500 dark:text-zinc-300',
    bgClass: 'bg-muted',
  },
  wishlist: {
    label: 'Wishlist',
    icon: '⭐',
    textClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-500/15 dark:bg-amber-500/10',
  },
  follow_up: {
    label: 'Follow Up',
    icon: '📬',
    textClass: 'text-teal-600 dark:text-teal-400',
    bgClass: 'bg-teal-500/15 dark:bg-teal-500/10',
  },
  offer_pending: {
    label: 'Offer Pending',
    icon: '⏳',
    textClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-500/15 dark:bg-purple-500/10',
  },
  interview: {
    label: 'Interview',
    icon: '📞',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-500/15 dark:bg-blue-500/10',
  },
  unknown: {
    label: 'Unknown',
    icon: '❔',
    textClass: 'text-muted-foreground',
    bgClass: 'bg-muted/60',
  },
};

export function getStatusVisual(status: string | null | undefined): StatusVisual {
  if (!status) return STATUS_UI.unknown;

  const normalized = status.toLowerCase() as StatusKey;
  return (
    STATUS_UI[normalized] ||
    STATUS_UI[
      (normalized.includes('interview') ? 'interview' : normalized.includes('offer') ? 'offer' : 'unknown') as StatusKey
    ]
  );
}

export function statusBadgeClasses() {
  return BASE_BADGE_CLASSES;
}

