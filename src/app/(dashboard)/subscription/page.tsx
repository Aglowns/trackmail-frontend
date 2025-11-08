'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

import { apiClient } from '@/lib/api';
import type { SubscriptionPlan, SubscriptionStatusResponse } from '@/types/subscription';
import { SubscriptionLimitIndicator, SubscriptionUpgradeDialog } from '@/components/subscription';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BillingPeriod = 'monthly' | 'yearly';

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    async function loadStatus() {
      try {
        setLoadingStatus(true);
        const data = await apiClient.getSubscriptionStatus();
        setStatus(data);
      } catch (error) {
        console.error('Failed to load subscription status', error);
        toast.error('Unable to load subscription details. Please try again.');
      } finally {
        setLoadingStatus(false);
      }
    }

    void loadStatus();
  }, []);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoadingPlans(true);
        const data = await apiClient.getSubscriptionPlans();
        setPlans(data);
      } catch (error) {
        console.error('Failed to load subscription plans', error);
        toast.error('Unable to load plans. Please try again.');
      } finally {
        setLoadingPlans(false);
      }
    }

    void loadPlans();
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success) {
      toast.success('Payment successful! Your subscription will be updated shortly.');
      // Remove query params after showing toast
      router.replace('/subscription');
    } else if (canceled) {
      toast('Checkout cancelled. You can restart the upgrade anytime.');
      router.replace('/subscription');
    }
  }, [router, searchParams]);

  const currentPlan = useMemo(() => {
    if (!status?.subscription.plan_id) return null;
    return plans.find((plan) => plan.id === status.subscription.plan_id) ?? null;
  }, [plans, status]);

  const currentPlanName = currentPlan?.name ?? plans.find(
    (plan) => plan.display_name.toLowerCase() === (status?.subscription.plan_name ?? '').toLowerCase(),
  )?.name ?? undefined;

  const handleUpgrade = useCallback(
    async (plan: SubscriptionPlan, billingPeriod: BillingPeriod) => {
      try {
        setCheckoutLoading(true);
        const checkout = await apiClient.createSubscriptionCheckout(plan.name, billingPeriod);
        if (checkout.checkout_url) {
          window.location.href = checkout.checkout_url;
        } else {
          throw new Error('Checkout URL missing from response');
        }
      } catch (error) {
        console.error('Failed to start checkout session', error);
        toast.error('Unable to start checkout session. Please try again.');
      } finally {
        setCheckoutLoading(false);
      }
    },
    [],
  );

  const loading = loadingStatus || loadingPlans;
  const usage = status?.usage;
  const planDisplayName = currentPlan?.display_name ?? status?.subscription.plan_name ?? 'Free';
  const features = status?.features;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">
            View your current plan, usage, and upgrade options.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Secure payments powered by Stripe
        </div>
      </header>

      <SubscriptionLimitIndicator
        planName={planDisplayName}
        applicationsCount={usage?.applications_count ?? 0}
        applicationsLimit={usage?.applications_limit}
        features={features}
        isLoading={checkoutLoading}
        onUpgradeClick={() => setUpgradeOpen(true)}
        showUpgradeCta
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Plans & features</h2>
            <p className="text-sm text-muted-foreground">
              Compare what&apos;s included in each plan and choose the best fit for your job search.
            </p>
          </div>
          <Button onClick={() => setUpgradeOpen(true)} disabled={loading || checkoutLoading}>
            Upgrade Plan
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading subscription details...
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <PlanSummaryCard
                key={plan.id}
                plan={plan}
                current={plan.id === currentPlan?.id}
              />
            ))}
          </div>
        )}
      </section>

      <SubscriptionUpgradeDialog
        plans={plans}
        currentPlanName={currentPlanName}
        onUpgrade={handleUpgrade}
        isProcessing={checkoutLoading}
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
      />
    </div>
  );
}

interface PlanSummaryCardProps {
  plan: SubscriptionPlan;
  current?: boolean;
}

function PlanSummaryCard({ plan, current = false }: PlanSummaryCardProps) {
  const features = plan.features ?? {};
  const priceMonthly = Number(plan.price_monthly ?? 0);
  const priceYearly = Number(plan.price_yearly ?? 0);

  return (
    <Card
      className={cn(
        'relative overflow-hidden border border-border/70 bg-card/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20',
        current && 'border-primary/60 shadow-primary/30',
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
              {plan.display_name}
              {plan.name === 'pro' && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Most popular
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </div>
          {current && (
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-500">
              Current plan
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p className="text-3xl font-bold">${priceMonthly.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-primary">${priceYearly.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">per year</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <FeatureItem enabled>
          {features.unlimited_applications
            ? 'Unlimited tracked applications'
            : `${features.max_applications ?? 25} tracked applications`}
        </FeatureItem>
        <FeatureItem enabled={Boolean(features.auto_tracking)}>
          Automatic Gmail email tracking
        </FeatureItem>
        <FeatureItem enabled={Boolean(features.advanced_analytics)}>
          Advanced analytics dashboard
        </FeatureItem>
        <FeatureItem enabled={Boolean(features.export_data)}>
          Export your application data (CSV & JSON)
        </FeatureItem>
      </CardContent>
    </Card>
  );
}

interface FeatureItemProps {
  children: ReactNode;
  enabled?: boolean;
}

function FeatureItem({ children, enabled = false }: FeatureItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border border-border/50 bg-background/60 p-3',
        enabled ? 'border-primary/30 bg-primary/5 text-foreground' : 'opacity-80',
      )}
    >
      <Check
        className={cn(
          'mt-0.5 h-4 w-4 flex-shrink-0',
          enabled ? 'text-primary' : 'text-muted-foreground',
        )}
      />
      <span>{children}</span>
    </div>
  );
}

