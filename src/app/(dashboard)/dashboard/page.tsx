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
  key: ApplicationStatus;
  title: string;
  indicator: string;
}> = [
  { key: 'applied', title: 'Applied', indicator: 'bg-slate-200 text-slate-700' },
  { key: 'screening', title: 'In Review', indicator: 'bg-blue-100 text-blue-600' },
  { key: 'assessment', title: 'Assessment', indicator: 'bg-amber-100 text-amber-600' },
  { key: 'interviewing', title: 'Interview', indicator: 'bg-emerald-100 text-emerald-600' },
];

function statusLabel(status: ApplicationStatus): string {
  switch (status) {
    case 'applied':
      return 'Applied';
    case 'screening':
      return 'In Review';
    case 'interviewing':
    case 'interview_scheduled':
    case 'interview_completed':
      return 'Interview';
    case 'offer':
    case 'offer_received':
      return 'Offer';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'withdrawn':
      return 'Withdrawn';
    case 'wishlist':
      return 'Wishlist';
    default:
      return status.replace('_', ' ');
  }
}

function confidenceBadge(confidence?: string) {
  if (!confidence) return null;
  const color =
    confidence === 'High'
      ? 'bg-emerald-100 text-emerald-700'
      : confidence === 'Medium'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-200 text-slate-600';
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
      applications: columns[column.key] ?? [],
    }));
  }, [columns]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Application Dashboard</h1>
          <p className="text-sm text-slate-500">Track and manage your job applications</p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/applications/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Application
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading applications...
          </div>
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto pb-4 sm:mx-0">
          <div className="flex min-w-[720px] gap-4 px-4 sm:min-w-0 sm:grid sm:grid-cols-2 sm:px-0 xl:grid-cols-4">
            {columnCards.map(({ key, title, indicator, applications }) => (
              <Card key={key} className="border-none bg-white shadow-sm">
                <CardHeader className="flex flex-col space-y-1 pb-3">
                  <CardTitle className="flex items-center justify-between text-base font-semibold text-slate-800">
                    <span>{title}</span>
                    <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${indicator}`}>
                      {applications.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applications.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
                      No applications yet
                    </div>
                  ) : (
                    applications.map((application) => (
                      <article
                        key={application.id}
                        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              {application.company?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {application.position}
                              </p>
                              <p className="truncate text-xs text-slate-500">{application.company}</p>
                            </div>
                          </div>
                          {confidenceBadge(application.confidence)}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {application.location && (
                            <span className="rounded-full bg-slate-100 px-2 py-1">{application.location}</span>
                          )}
                          <span className="rounded-full bg-slate-100 px-2 py-1">
                            {statusLabel(application.status)}
                          </span>
                          {application.applied_at && (
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              {new Date(application.applied_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                          <span className="truncate">
                            {application.source ?? 'Unknown source'}
                          </span>
                          <Link
                            href={`/applications/${application.id}`}
                            className="whitespace-nowrap font-medium text-indigo-600 hover:text-indigo-700"
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
