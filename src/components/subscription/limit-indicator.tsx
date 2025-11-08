'use client';

import { memo } from 'react';
import { ArrowUpRight, CheckCircle2, Infinity, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SubscriptionFeatures } from '@/types/subscription';

export interface SubscriptionLimitIndicatorProps {
  planName: string;
  applicationsCount: number;
  applicationsLimit?: number | null;
  features?: SubscriptionFeatures;
  isLoading?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
  showUpgradeCta?: boolean;
}

function computeProgress(count: number, limit?: number | null): number {
  if (!limit || limit <= 0) return 0;
  const ratio = count / limit;
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(100, Math.round(ratio * 100));
}

export const SubscriptionLimitIndicator = memo(function SubscriptionLimitIndicator({
  planName,
  applicationsCount,
  applicationsLimit,
  features,
  isLoading = false,
  onUpgradeClick,
  className,
  variant = 'default',
  showUpgradeCta = true,
}: SubscriptionLimitIndicatorProps) {
  const unlimited = Boolean(features?.unlimited_applications) || applicationsLimit == null;
  const progress = computeProgress(applicationsCount, applicationsLimit ?? undefined);
  const nearLimit = !unlimited && applicationsLimit ? progress >= 80 && progress < 100 : false;
  const limitReached = !unlimited && applicationsLimit ? applicationsCount >= applicationsLimit : false;

  const caption = (() => {
    if (isLoading) return 'Checking your usage...';
    if (unlimited) return 'You have unlimited applications with your current plan.';
    if (limitReached)
      return `You have reached your limit of ${applicationsLimit} applications. Upgrade to unlock unlimited tracking.`;
    if (nearLimit)
      return `You have used ${applicationsCount} of ${applicationsLimit} applications. Upgrade now to stay ahead.`;
    return `You have used ${applicationsCount} of ${applicationsLimit ?? '—'} applications.`;
  })();

  const progressBar = (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
      <div
        className={cn(
          'h-full transition-all duration-500',
          limitReached
            ? 'bg-destructive'
            : nearLimit
              ? 'bg-amber-500'
              : 'bg-primary',
        )}
        style={{ width: unlimited ? '100%' : `${progress}%` }}
        aria-hidden
      />
    </div>
  );

  const icon = unlimited ? (
    <Infinity className="h-6 w-6 text-primary" />
  ) : limitReached ? (
    <AlertBadge className="text-destructive" />
  ) : nearLimit ? (
    <AlertBadge className="text-amber-500" />
  ) : (
    <CheckCircle2 className="h-6 w-6 text-primary" />
  );

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex flex-col gap-2 rounded-lg border border-border/70 bg-card/70 p-4 text-sm shadow-sm',
          className,
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-foreground">
            {icon}
            <span>{planName} Plan</span>
          </div>
          {!unlimited && (
            <span className="text-xs text-muted-foreground">
              {applicationsCount}/{applicationsLimit}
            </span>
          )}
        </div>
        {!unlimited && progressBar}
        <p className="text-xs text-muted-foreground">{caption}</p>
        {showUpgradeCta && onUpgradeClick && (limitReached || nearLimit) && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-primary/40 text-primary hover:bg-primary/10"
            onClick={onUpgradeClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                Upgrade Plan
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-border/70 bg-card/80 shadow-md shadow-primary/10',
        className,
      )}
    >
      <div className="absolute inset-x-0 -top-20 h-44 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent opacity-70 blur-3xl" />
      <div className="relative space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current Plan
            </p>
            <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
              {icon}
              <span>{planName}</span>
            </div>
          </div>
          {!unlimited && (
            <div className="rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
              {applicationsCount} of {applicationsLimit} applications used
            </div>
          )}
        </div>

        {!unlimited && (
          <div className="space-y-2">
            {progressBar}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{applicationsLimit ?? '—'} limit</span>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">{caption}</p>

        {showUpgradeCta && onUpgradeClick && (
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={onUpgradeClick}
              className="shadow-lg shadow-primary/30"
              disabled={isLoading || (!limitReached && !nearLimit && unlimited)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  Upgrade to Pro
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Unlock unlimited applications, automatic tracking, and advanced analytics.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
});

SubscriptionLimitIndicator.displayName = 'SubscriptionLimitIndicator';

function AlertBadge({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-6 w-6 items-center justify-center rounded-full bg-background/60', className)}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 12.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0-8a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0V7.5a1 1 0 0 0-1-1Z" />
      </svg>
    </div>
  );
}

