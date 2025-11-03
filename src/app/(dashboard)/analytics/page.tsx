'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import {
  AnalyticsOverview,
  AnalyticsTrends,
  AnalyticsCompanies,
  AnalyticsSources,
} from '@/types/application';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your application pipeline with insights and trends
        </p>
      </div>

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
              <p className="text-sm text-muted-foreground">No trend data available</p>
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
            {overview ? (
              Object.entries(overview.status_counts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatStatus(status)}</span>
                  <span className="font-semibold text-primary">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No status data available</p>
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
            {companies ? (
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
              <p className="text-sm text-muted-foreground">No company data available</p>
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
            {sources ? (
              <div className="space-y-3">
                {sources.top_sources.map((item) => (
                  <div key={item.source} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.source}</span>
                    <span className="font-semibold text-primary">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No source data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
