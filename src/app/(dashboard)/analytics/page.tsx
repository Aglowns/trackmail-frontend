'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Loader2, ShieldCheck } from 'lucide-react';

import {
  AnalyticsOverview,
  AnalyticsTrends,
  AnalyticsCompanies,
  AnalyticsSources,
} from '@/types/application';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const STATUS_LABELS: Record<string, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  screening: 'In Review',
  assessment: 'Assessment',
  interviewing: 'Interview',
  interview_scheduled: 'Interview Scheduled',
  interview_completed: 'Interview Completed',
  offer: 'Offer',
  offer_received: 'Offer Received',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status.replace('_', ' ');
}

function formatNumber(value: number): string {
  if (value >= 1000) {
    return `${Math.round((value / 1000) * 10) / 10}k`;
  }
  return value.toString();
}

const cardBaseStyles =
  'group relative overflow-hidden border border-border/60 bg-card/80 shadow-lg shadow-primary/5 transition duration-300 hover:-translate-y-1 hover:shadow-primary/20';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [companies, setCompanies] = useState<AnalyticsCompanies | null>(null);
  const [sources, setSources] = useState<AnalyticsSources | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [overviewData, trendData, companyData, sourceData] = await Promise.all([
          apiClient.getAnalyticsOverview(),
          apiClient.getAnalyticsTrends(),
          apiClient.getAnalyticsCompanies(),
          apiClient.getAnalyticsSources(),
        ]);
        setOverview(overviewData);
        setTrends(trendData);
        setCompanies(companyData);
        setSources(sourceData);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 403) {
            setAccessDenied(true);
            return;
          }
          const detail = error.response?.data?.detail;
          if (typeof detail === 'string') {
            setErrorMessage(detail);
          } else {
            setErrorMessage('Unable to load analytics data. Please try again later.');
          }
        } else {
          setErrorMessage('Unable to load analytics data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

  const hasAnyData = useMemo(
    () =>
      Boolean(
        (overview && overview.total_applications > 0) ||
          (trends && trends.trend_data.length > 0) ||
          (companies && companies.top_companies.length > 0) ||
          (sources && sources.top_sources.length > 0),
      ),
    [overview, trends, companies, sources],
  );

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/80">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card shadow-lg shadow-primary/20">
          <div className="flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                <ShieldCheck className="h-4 w-4" />
                Pro Feature
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Advanced analytics are a Pro feature</h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Unlock visual trends, top companies, and source insights to accelerate your job search. Upgrade to Pro
                  to access the full analytics suite.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="shadow-lg shadow-primary/40"
              onClick={() => {
                window.location.href = '/subscription';
              }}
            >
              Upgrade to Pro
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-muted-foreground">What you’ll unlock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>📈 Application trends and conversion rates</p>
              <p>🏢 Top companies you’ve engaged with</p>
              <p>🔍 Source breakdown of successful applications</p>
              <p>✅ Pipeline status summaries for every stage</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-muted-foreground">Why analytics matter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Spot which applications are paying off and double down on what works.</p>
              <p>Identify bottlenecks in your interview pipeline.</p>
              <p>Track response rate improvements over time.</p>
              <p>Export ready-to-share reports for mentors and accountability partners.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-8 text-center text-destructive">
        <p className="text-sm font-medium">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your application pipeline with insights and trends
        </p>
      </div>

      {!hasAnyData && (
        <Card className="border border-border/60 bg-card/80">
          <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No analytics yet—let’s add some applications.</p>
            <p>
              Once you begin tracking jobs, we’ll surface trends, response rates, and insights automatically. Try adding
              your most recent applications to get started.
            </p>
            <Button
              variant="outline"
              className="w-fit"
              onClick={() => {
                window.location.href = '/applications/new';
              }}
            >
              Add an application
            </Button>
          </CardContent>
        </Card>
      )}

      {overview && (
        <div className="-mx-4 overflow-x-auto pb-2 sm:mx-0">
          <div className="flex min-w-[720px] gap-4 px-4 md:grid md:min-w-0 md:grid-cols-2 xl:grid-cols-4 md:px-0">
            <Card className={cardBaseStyles}>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-3xl font-semibold">
                  {formatNumber(overview.total_applications)}
                </p>
              </CardContent>
            </Card>

            <Card className={cardBaseStyles}>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Applied last 30 days</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-3xl font-semibold">
                  {formatNumber(overview.applications_this_month)}
                </p>
              </CardContent>
            </Card>

            <Card className={cardBaseStyles}>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Response rate</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-3xl font-semibold">
                  {overview.response_rate}%
                </p>
              </CardContent>
            </Card>

            <Card className={cardBaseStyles}>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active pipelines</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-3xl font-semibold">
                  {
                    Object.keys(overview.status_counts).filter(
                      (status) => status !== 'applied',
                    ).length
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className={`${cardBaseStyles} lg:col-span-2`}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative">
            <CardTitle className="text-base font-semibold">
              Applications trend
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {trends ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last 30 days</span>
                  <span>{trends.total_in_period} total submissions</span>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  {trends.trend_data.map((point) => (
                    <div key={point.date} className="flex h-24 flex-col justify-end">
                      <div
                        className="rounded-t-md bg-primary/60"
                        style={{ height: `${Math.min(100, point.applications * 20)}%` }}
                      />
                      <span className="truncate pt-2 text-[11px] text-muted-foreground">
                        {new Date(point.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="Add a few applications to see trend insights over time." />
            )}
          </CardContent>
        </Card>

        <Card className={cardBaseStyles}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative">
            <CardTitle className="text-base font-semibold">
              Pipeline status
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-3">
            {overview && Object.keys(overview.status_counts).length > 0 ? (
              Object.entries(overview.status_counts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatStatus(status)}</span>
                  <span className="font-semibold text-primary">{count}</span>
                </div>
              ))
            ) : (
              <EmptyState message="We’ll populate your pipeline status as applications move forward." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={cardBaseStyles}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative">
            <CardTitle className="text-base font-semibold">
              Top companies
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {companies && companies.top_companies.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Total companies</span>
                  <span className="font-semibold text-primary">
                    {companies.unique_companies}
                  </span>
                </div>
                <div className="space-y-3">
                  {companies.top_companies.map((item) => (
                    <div key={item.company} className="flex items-center justify-between text-sm">
                      <span className="truncate text-muted-foreground">{item.company}</span>
                      <span className="font-semibold text-primary">{item.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState message="Track more applications to reveal your top companies." />
            )}
          </CardContent>
        </Card>

        <Card className={cardBaseStyles}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardHeader className="relative">
            <CardTitle className="text-base font-semibold">
              Sources breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {sources && sources.top_sources.length > 0 ? (
              <div className="space-y-3">
                {sources.top_sources.map((item) => (
                  <div key={item.source} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.source}</span>
                    <span className="font-semibold text-primary">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="Categorize applications by source to see which ones convert best." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground">{message}</p>;
}
