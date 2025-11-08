'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Crown, Loader2, Sparkles, Star } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SubscriptionPlan } from '@/types/subscription';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const FEATURE_LABELS: Record<string, (plan: SubscriptionPlan) => string | null> = {
  unlimited_applications: () => 'Unlimited applications',
  auto_tracking: () => 'Automatic email tracking',
  advanced_analytics: () => 'Advanced analytics & insights',
  export_data: () => 'Export your data (CSV & JSON)',
  max_applications: (plan) =>
    plan.features?.max_applications
      ? `${plan.features.max_applications} tracked applications`
      : null,
};

type BillingPeriod = 'monthly' | 'yearly';

export interface SubscriptionUpgradeDialogProps {
  trigger?: React.ReactNode;
  plans: SubscriptionPlan[];
  currentPlanName?: string;
  onUpgrade: (plan: SubscriptionPlan, billingPeriod: BillingPeriod) => Promise<void> | void;
  isProcessing?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialPlanName?: string;
}

export function SubscriptionUpgradeDialog({
  trigger,
  plans,
  currentPlanName,
  onUpgrade,
  isProcessing = false,
  defaultOpen = false,
  open,
  onOpenChange,
  initialPlanName,
}: SubscriptionUpgradeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [internalProcessing, setInternalProcessing] = useState(false);

  const selectablePlans = useMemo(
    () => plans.filter((plan) => plan.name !== 'free'),
    [plans],
  );

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => {
    if (selectablePlans.length === 0) return null;
    const preferred = selectablePlans.find((plan) => plan.name !== currentPlanName);
    return (preferred ?? selectablePlans[0])?.id ?? null;
  });

  const selectedPlan = useMemo(
    () => selectablePlans.find((plan) => plan.id === selectedPlanId) ?? null,
    [selectablePlans, selectedPlanId],
  );

  const processing = isProcessing || internalProcessing;

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!dialogOpen || selectablePlans.length === 0) return;

    if (initialPlanName) {
      const preferred = selectablePlans.find((plan) => plan.name === initialPlanName);
      if (preferred) {
        setSelectedPlanId(preferred.id);
        return;
      }
    }

    const fallback = selectablePlans.find((plan) => plan.name !== currentPlanName) ?? selectablePlans[0];
    setSelectedPlanId(fallback?.id ?? null);
  }, [dialogOpen, initialPlanName, selectablePlans, currentPlanName]);

  const handleUpgrade = async () => {
    if (!selectedPlan || !onUpgrade) return;
    try {
      setInternalProcessing(true);
      await onUpgrade(selectedPlan, billingPeriod);
      setDialogOpen(false);
    } finally {
      setInternalProcessing(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="shadow-lg shadow-primary/30">
            Upgrade to Pro
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Crown className="h-5 w-5 fill-primary/20" />
            <p className="text-sm font-semibold uppercase tracking-wide">Unlock Pro Features</p>
          </div>
          <DialogTitle className="text-2xl font-bold">
            Grow faster with unlimited tracking & powerful automation
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Upgrade to unlock unlimited applications, automatic Gmail tracking, advanced analytics, and more.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <BillingToggle value={billingPeriod} onChange={setBillingPeriod} />

          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingPeriod={billingPeriod}
                selected={plan.id === selectedPlanId}
                current={plan.name === currentPlanName}
                onSelect={() => {
                  if (plan.name === currentPlanName) return;
                  setSelectedPlanId(plan.id);
                }}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="mt-4 gap-3">
          <Button
            variant="outline"
            disabled={processing}
            onClick={() => setDialogOpen(false)}
          >
            Not now
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={!selectedPlan || processing || selectedPlan.name === currentPlanName}
            className="shadow-lg shadow-primary/30"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing checkout...
              </>
            ) : (
              <>
                Start {selectedPlan?.display_name ?? 'Pro'} plan
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
}

function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-border/70 bg-muted/40 p-1 text-sm">
      {(['monthly', 'yearly'] as BillingPeriod[]).map((period) => (
        <button
          key={period}
          type="button"
          className={cn(
            'flex items-center gap-1 rounded-full px-4 py-2 font-medium transition',
            value === period
              ? 'bg-background shadow-sm shadow-primary/20 text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={() => onChange(period)}
        >
          {period === 'monthly' ? 'Monthly' : 'Yearly'}
          {period === 'yearly' && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-500">
              Save 2 months
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  selected: boolean;
  current: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, billingPeriod, selected, current, onSelect }: PlanCardProps) {
  const price =
    billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const formattedPrice =
    price > 0 ? formatter.format(price) : 'Free';

  const featureList = Object.entries(plan.features ?? {})
    .map(([key, value]) => {
      if (key === 'max_applications' && plan.features.max_applications) {
        return `${plan.features.max_applications} tracked applications`;
      }
      if (typeof value === 'boolean') {
        if (value && FEATURE_LABELS[key]) {
          return FEATURE_LABELS[key](plan);
        }
        return null;
      }
      if (FEATURE_LABELS[key]) {
        return FEATURE_LABELS[key](plan);
      }
      return null;
    })
    .filter((text): text is string => Boolean(text));

  const periodCaption =
    billingPeriod === 'monthly' ? 'per month' : 'per year';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex h-full flex-col gap-4 rounded-2xl border bg-background/80 p-6 text-left transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selected ? 'border-primary/60 shadow-lg shadow-primary/30' : 'border-border/60 shadow-sm',
        current && 'opacity-75',
      )}
      disabled={current}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">{plan.display_name}</h3>
            {plan.name === 'pro' && (
              <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                <Star className="h-3 w-3" />
                Most popular
              </Badge>
            )}
            {current && (
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-500">
                Current plan
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.description ?? 'A flexible plan designed to help you manage applications with ease.'}
          </p>
        </div>
        {selected && !current && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Check className="h-4 w-4" />
          </span>
        )}
      </div>

      <div>
        <p className="text-3xl font-bold text-foreground">
          {formattedPrice}
        </p>
        {plan.name !== 'free' && (
          <p className="text-sm text-muted-foreground">{periodCaption}</p>
        )}
      </div>

      <ul className="grid gap-2 text-sm text-muted-foreground">
        {featureList.length > 0 ? (
          featureList.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))
        ) : (
          <li className="text-muted-foreground/80 text-sm">
            Essential job tracking capabilities.
          </li>
        )}
      </ul>

      {current && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-600">
          You&apos;re already enjoying this plan.
        </p>
      )}
    </button>
  );
}

