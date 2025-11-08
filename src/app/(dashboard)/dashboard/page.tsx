'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { apiClient } from '@/lib/api';
import { Application, ApplicationStatus } from '@/types/application';
import type { SubscriptionStatusResponse } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionLimitIndicator } from '@/components/subscription';

const COLUMN_CONFIG: Array<{
  statuses: ApplicationStatus[];
  title: string;
  indicator: string;
}> = [
  { statuses: ['applied'], title: 'Applied', indicator: 'bg-primary/10 text-primary' },
  {
    statuses: ['interviewing', 'interview_scheduled', 'interview_completed', 'screening'],
    title: 'Interviewed',
    indicator: 'bg-primary/10 text-primary',
  },
  { statuses: ['offer', 'offer_received', 'accepted'], title: 'Offer', indicator: 'bg-primary/10 text-primary' },
  { statuses: ['rejected'], title: 'Rejected', indicator: 'bg-primary/10 text-primary' },
  { statuses: ['withdrawn'], title: 'Withdrawn', indicator: 'bg-primary/10 text-primary' },
];

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screening: 'Applied',
  interviewing: 'Interviewed',
  interview_scheduled: 'Interviewed',
  interview_completed: 'Interviewed',
  offer: 'Offer',
  offer_received: 'Offer',
  accepted: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  wishlist: 'Wishlist',
};

function statusLabel(status: ApplicationStatus): string {
  return STATUS_LABELS[status] ?? status.replace('_', ' ');
}

function confidenceBadge(confidence?: string) {
  if (!confidence) return null;
  const color =
    confidence === 'High'
      ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
      : confidence === 'Medium'
        ? 'bg-amber-500/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200'
        : 'bg-muted text-muted-foreground';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{confidence}</span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<Record<string, Application[]>>({});
  const [subscription, setSubscription] = useState<SubscriptionStatusResponse | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const grouped = await apiClient.getApplicationsByStatus();
        setColumns(grouped);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        setLoadingSubscription(true);
        const status = await apiClient.getSubscriptionStatus();
        setSubscription(status);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingSubscription(false);
      }
    }

    void fetchSubscription();
  }, []);

  const columnCards = useMemo(() => {
    return COLUMN_CONFIG.map((column) => ({
      ...column,
      applications: column.statuses.flatMap((status) => columns[status] ?? []),
    }));
  }, [columns]);

  const totalApplications = useMemo(
    () =>
      Object.values(columns).reduce((sum, apps) => {
        if (!Array.isArray(apps)) return sum;
        return sum + apps.length;
      }, 0),
    [columns],
  );

  const interviewsCount = (columns.interviewing?.length ?? 0) +
    (columns.interview_scheduled?.length ?? 0) +
    (columns.interview_completed?.length ?? 0) +
    (columns.screening?.length ?? 0);

  const offersCount =
    (columns.offer?.length ?? 0) + (columns.offer_received?.length ?? 0) + (columns.accepted?.length ?? 0);

  const rejectedCount = columns.rejected?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Application Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track and manage your job applications</p>
        </div>
        <Button asChild size="lg" className="w-full shadow-lg shadow-primary/30 sm:w-auto">
          <Link href="/applications/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Application
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={totalApplications}
          trendLabel="All time submissions"
        />
        <StatCard
          title="Interview Pipeline"
          value={interviewsCount}
          trendLabel="Interviews and screenings"
          tone="primary"
        />
        <StatCard
          title="Offers Received"
          value={offersCount}
          trendLabel="Offers & acceptances"
          tone="success"
        />
        <StatCard
          title="Rejections"
          value={rejectedCount}
          trendLabel="Stay resilient!"
          tone="warning"
        />
      </div>

      <SubscriptionLimitIndicator
        variant="compact"
        planName={subscription?.subscription.plan_name ?? 'Free'}
        applicationsCount={subscription?.usage.applications_count ?? 0}
        applicationsLimit={subscription?.usage.applications_limit}
        features={subscription?.features}
        isLoading={loadingSubscription}
        onUpgradeClick={() => router.push('/subscription')}
        showUpgradeCta
      />

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading applications...
          </div>
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto pb-4 sm:mx-0">
          <div className="flex min-w-[720px] gap-4 px-4 sm:min-w-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-5">
            {columnCards.map(({ title, indicator, applications }) => (
              <Card
                key={title}
                className="group relative overflow-hidden border border-border/60 bg-card/80 shadow-lg shadow-primary/5 transition duration-300 hover:-translate-y-1 hover:shadow-primary/20"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative flex flex-col space-y-1 pb-3">
                  <CardTitle className="flex items-center justify-between text-base font-semibold">
                    <span>{title}</span>
                    <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${indicator}`}>
                      {applications.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  {applications.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/40 py-8 text-center text-sm text-muted-foreground">
                      No applications yet
                    </div>
                  ) : (
                    applications.map((application) => (
                      <article
                        key={application.id}
                        className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                              {application.company?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">
                                {application.position}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">{application.company}</p>
                            </div>
                          </div>
                          {confidenceBadge(application.confidence)}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {application.location && (
                            <span className="rounded-full bg-muted/60 px-2 py-1">{application.location}</span>
                          )}
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                            {statusLabel(application.status)}
                          </span>
                          {application.applied_at && (
                            <span className="rounded-full bg-muted/60 px-2 py-1">
                              {new Date(application.applied_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                          <span className="truncate">
                            {application.source ?? 'Unknown source'}
                          </span>
                          <Link
                            href={`/applications/${application.id}`}
                            className="whitespace-nowrap font-medium text-primary hover:text-primary/80"
                          >
                            View Timeline
                          </Link>
                        </div>
                      </article>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  trendLabel: string;
  tone?: 'default' | 'primary' | 'success' | 'warning';
}

function StatCard({ title, value, trendLabel, tone = 'default' }: StatCardProps) {
  const toneStyles =
    tone === 'primary'
      ? 'bg-primary/10 text-primary border-primary/40'
      : tone === 'success'
        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40'
        : tone === 'warning'
          ? 'bg-amber-500/10 text-amber-600 border-amber-500/40'
          : 'bg-muted/60 text-muted-foreground border-border/60';

  return (
    <Card className="relative overflow-hidden border border-border/60 bg-card/80 shadow-sm shadow-primary/5 transition hover:shadow-primary/20">
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
      <CardHeader className="relative pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      </CardHeader>
      <CardContent className="relative space-y-2">
        <div className="text-3xl font-semibold text-foreground">{value}</div>
        <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${toneStyles}`}>
          {trendLabel}
        </span>
      </CardContent>
    </Card>
  );
}
