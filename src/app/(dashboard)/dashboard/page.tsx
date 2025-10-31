'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { apiClient } from '@/lib/api';
import { Application, ApplicationStatus } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLUMN_CONFIG: Array<{
  statuses: ApplicationStatus[];
  title: string;
  indicator: string;
  headerColor: string;
}> = [
  { 
    statuses: ['applied'], 
    title: 'Applied', 
    indicator: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    headerColor: 'border-t-4 border-t-blue-500'
  },
  {
    statuses: ['interviewing', 'interview_scheduled', 'interview_completed', 'screening'],
    title: 'Interviewed',
    indicator: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    headerColor: 'border-t-4 border-t-purple-500'
  },
  { 
    statuses: ['offer', 'offer_received', 'accepted'], 
    title: 'Offer', 
    indicator: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    headerColor: 'border-t-4 border-t-emerald-500'
  },
  { 
    statuses: ['rejected'], 
    title: 'Rejected', 
    indicator: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    headerColor: 'border-t-4 border-t-red-500'
  },
  { 
    statuses: ['withdrawn'], 
    title: 'Withdrawn', 
    indicator: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    headerColor: 'border-t-4 border-t-gray-500'
  },
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
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<Record<string, Application[]>>({});

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

  const columnCards = useMemo(() => {
    return COLUMN_CONFIG.map((column) => ({
      ...column,
      applications: column.statuses.flatMap((status) => columns[status] ?? []),
    }));
  }, [columns]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Application Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track and manage your job applications</p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/applications/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Application
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading applications...
          </div>
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto pb-4 sm:mx-0">
          <div className="flex min-w-[720px] gap-4 px-4 sm:min-w-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-5">
            {columnCards.map(({ title, indicator, headerColor, applications }) => (
              <Card key={title} className={`shadow-sm transition-all hover:shadow-md ${headerColor}`}>
                <CardHeader className="flex flex-col space-y-1 pb-3">
                  <CardTitle className="flex items-center justify-between text-base font-semibold">
                    <span>{title}</span>
                    <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${indicator}`}>
                      {applications.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applications.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/50 py-8 text-center text-sm text-muted-foreground">
                      No applications yet
                    </div>
                  ) : (
                    applications.map((application) => (
                      <article
                        key={application.id}
                        className="group cursor-pointer space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                              {application.company?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                                {application.position}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">{application.company}</p>
                            </div>
                          </div>
                          {confidenceBadge(application.confidence)}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {application.location && (
                            <span className="rounded-full bg-muted px-2 py-1">{application.location}</span>
                          )}
                          <span className="rounded-full bg-muted px-2 py-1">
                            {statusLabel(application.status)}
                          </span>
                          {application.applied_at && (
                            <span className="rounded-full bg-muted px-2 py-1">
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
