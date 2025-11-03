'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Download, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

import { apiClient } from '@/lib/api';
import { Application, ApplicationFilters, ApplicationStatus } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const statusOptions: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewed' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const sources = ['All Sources', 'LinkedIn', 'Company', 'Indeed', 'Referral', 'Glassdoor'];
const dateRanges = ['Date Applied', 'Last Updated'];

export default function ApplicationsPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ApplicationFilters>({ status: 'all' });
  const [applications, setApplications] = useState<Application[]>([]);

  // Read search query from URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setFilters(prev => ({ ...prev, search: searchFromUrl }));
    }
  }, [searchParams]);

  const activeFilters = useMemo(() => ({ ...filters }), [filters]);

  useEffect(() => {
    async function fetchApplications() {
      try {
        setLoading(true);
        const result = await apiClient.getApplications(activeFilters, 1, 100);
        setApplications(result.applications);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load applications');
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [activeFilters]);

  async function handleExport() {
    try {
      const blob = await apiClient.exportApplications(activeFilters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'applications.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Failed to export applications');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Applications</h1>
          <p className="text-sm text-muted-foreground">Manage and track all your job applications</p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button asChild>
            <Link href="/applications/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Application
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="space-y-6 p-4 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Select
              value={filters.status ?? 'all'}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value as ApplicationStatus | 'all' }))}
            >
              <SelectTrigger className="h-11 rounded-xl text-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.source ?? 'All Sources'}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, source: value === 'All Sources' ? undefined : value }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl text-sm">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.date_from ? 'Custom Range' : 'Date Applied'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  date_from: value === 'Date Applied' ? undefined : prev.date_from,
                  date_to: value === 'Date Applied' ? undefined : prev.date_to,
                }))
              }
            >
              <SelectTrigger className="h-11 rounded-xl text-sm">
                <SelectValue placeholder="Date Applied" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
                <SelectItem value="Custom Range">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 rounded-xl border border-input bg-muted px-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                className="h-10 border-none bg-transparent text-sm"
                value={filters.search ?? ''}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, search: event.target.value || undefined }))
                }
              />
            </div>
          </div>

          <div className="-mx-4 overflow-x-auto rounded-2xl border border-border sm:mx-0">
            <Table className="min-w-[720px] sm:min-w-full">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12">
                    <input type="checkbox" className="h-4 w-4 rounded border-border" />
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading applications...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      No applications found. Adjust filters or add a new application.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((application) => (
                    <TableRow key={application.id} className="hover:bg-muted/50">
                      <TableCell>
                        <input type="checkbox" className="h-4 w-4 rounded border-border" />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {application.company?.charAt(0).toUpperCase() ?? '?'}
                          </span>
                          {application.company}
                        </div>
                      </TableCell>
                      <TableCell>{application.position}</TableCell>
                      <TableCell>{application.location ?? '—'}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                          {application.status.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {application.applied_at
                          ? new Date(application.applied_at).toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{application.confidence ?? '—'}</span>
                      </TableCell>
                      <TableCell>{application.source ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/applications/${application.id}`}
                          className="text-sm font-medium text-primary hover:text-primary/80"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-xs text-muted-foreground">
            Showing {applications.length} applications
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
