'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

import { ApplicationForm } from '@/components/applications/application-form';
import { SubscriptionUpgradeDialog } from '@/components/subscription';
import { apiClient } from '@/lib/api';
import type { CreateApplicationRequest } from '@/types/application';
import type { SubscriptionPlan, SubscriptionStatusResponse } from '@/types/subscription';

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const loadSubscriptionData = useCallback(async () => {
    if (plans.length > 0 && subscription) return;
    const [fetchedPlans, fetchedStatus] = await Promise.all([
      plans.length === 0 ? apiClient.getSubscriptionPlans() : Promise.resolve(plans),
      subscription ? Promise.resolve(subscription) : apiClient.getSubscriptionStatus(),
    ]);
    setPlans(fetchedPlans);
    setSubscription(fetchedStatus);
  }, [plans, subscription]);

  const currentPlanName = useMemo(
    () => subscription?.subscription.plan_name?.toLowerCase(),
    [subscription],
  );

  const handleUpgrade = useCallback(
    async (plan: SubscriptionPlan, billingPeriod: 'monthly' | 'yearly') => {
      try {
        setCheckoutLoading(true);
        const checkout = await apiClient.createSubscriptionCheckout(plan.name, billingPeriod);
        if (checkout.checkout_url) {
          window.location.href = checkout.checkout_url;
        } else {
          throw new Error('Checkout URL missing from response');
        }
      } catch (err) {
        console.error('Failed to start checkout session', err);
        toast.error('Unable to start checkout session. Please try again.');
      } finally {
        setCheckoutLoading(false);
      }
    },
    [],
  );

  const handleSubmit = async (data: CreateApplicationRequest) => {
    try {
      setLoading(true);
      setError('');
      await apiClient.createApplication(data);
      toast.success('Application created successfully!');
      router.push('/');
    } catch (err) {
      let message = 'Failed to create application';

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        if (detail && typeof detail === 'object') {
          const { error: errorCode, message: detailMessage } = detail as Record<string, unknown>;
          if (errorCode === 'limit_exceeded') {
            message =
              typeof detailMessage === 'string'
                ? detailMessage
                : 'You have reached your free plan limit. Upgrade to unlock unlimited tracking.';
            toast.error(message, { duration: 6000 });
            await loadSubscriptionData();
            setUpgradeOpen(true);
          } else if (typeof detailMessage === 'string') {
            message = detailMessage;
          }
        } else if (typeof detail === 'string') {
          message = detail;
        }
      }

      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-2xl">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <ApplicationForm onSubmit={handleSubmit} loading={loading} submitText="Create Application" />
      </div>

      <SubscriptionUpgradeDialog
        plans={plans}
        currentPlanName={currentPlanName}
        onUpgrade={handleUpgrade}
        isProcessing={checkoutLoading}
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        initialPlanName="pro"
      />
    </>
  );
}
