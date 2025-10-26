'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar, Clock, Mail, NotebookPen, Plus, ArrowLeft } from 'lucide-react';

import { apiClient } from '@/lib/api';
import { Application, TimelineEvent } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type TabKey = 'timeline' | 'details' | 'notes' | 'emails';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'details', label: 'Details' },
  { key: 'notes', label: 'Notes' },
  { key: 'emails', label: 'Emails' },
];

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [app, timeline] = await Promise.all([
          apiClient.getApplication(params.id),
          apiClient.getApplicationEvents(params.id),
        ]);
        setApplication(app);
        setEvents(timeline);
      } catch (error) {
        console.error(error);
        toast.error('Unable to load application');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-slate-500">
        Loading application...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
        Application not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" asChild className="px-0 text-slate-500 hover:text-slate-700">
            <Link href="/applications" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to applications
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{application.position}</h1>
            <p className="text-sm text-slate-500">{application.company}</p>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2" asChild>
          <Link href={`/applications/${application.id}/edit`}>
            <NotebookPen className="h-4 w-4" /> Edit Application
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-none bg-white shadow-sm">
          <CardContent className="space-y-6 p-4 sm:p-6">
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-base font-semibold text-slate-600">
                  {application.company?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{application.company}</h2>
                  <p className="text-xs text-slate-500">{application.location ?? 'Location unknown'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                  Status
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600">
                    {application.status.replace('_', ' ')}
                  </span>
                </p>
                <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Applied {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : '—'}
                </p>
              </div>
            </section>

            <section className="space-y-3 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Confidence & Source
              </h3>
              <div className="space-y-2 rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
                <p className="flex items-center justify-between">
                  Confidence
                  <span className="font-medium text-slate-900">{application.confidence ?? 'Not set'}</span>
                </p>
                <p className="flex items-center justify-between">
                  Source
                  <span className="font-medium text-slate-900">{application.source ?? '—'}</span>
                </p>
                <p className="flex items-center justify-between">
                  Salary Range
                  <span className="font-medium text-slate-900">{application.salary_range ?? '—'}</span>
                </p>
              </div>
            </section>

            {application.notes && (
              <section className="space-y-3 text-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Notes
                </h3>
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {application.notes}
                </p>
              </section>
            )}

            <Button variant="outline" className="w-full items-center gap-2">
              <Plus className="h-4 w-4" /> Add Timeline Event
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-slate-200 px-4 sm:px-6 overflow-x-auto">
              <div className="flex min-w-[320px] gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`border-b-2 px-2 py-4 text-sm font-medium transition ${
                      activeTab === tab.key
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-6 sm:px-6">
              {activeTab === 'timeline' && <Timeline events={events} />}
              {activeTab === 'details' && <Details application={application} />}
              {activeTab === 'notes' && <Notes notes={application.notes} />}
              {activeTab === 'emails' && <Emails />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        No timeline events yet. Add events to track progress.
      </div>
    );
  }

  return (
    <ol className="space-y-6">
      {events.map((event) => (
        <li key={event.id} className="relative flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
              <span>{event.event_type.replace('_', ' ')}</span>
              <span>{new Date(event.created_at).toLocaleString()}</span>
            </div>
            {event.status && (
              <div className="text-xs text-slate-500">Status: {event.status.replace('_', ' ')}</div>
            )}
            {event.notes && <p className="text-sm text-slate-600">{event.notes}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Details({ application }: { application: Application }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <InfoBlock title="Company" value={application.company} icon={<Mail className="h-4 w-4" />} />
      <InfoBlock title="Position" value={application.position} icon={<NotebookPen className="h-4 w-4" />} />
      <InfoBlock title="Source" value={application.source ?? '—'} icon={<Mail className="h-4 w-4" />} />
      <InfoBlock title="Applied Date" value={application.applied_at ? new Date(application.applied_at).toLocaleDateString() : '—'} icon={<Calendar className="h-4 w-4" />} />
    </div>
  );
}

function InfoBlock({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
        {icon}
        {title}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function Notes({ notes }: { notes?: string }) {
  if (!notes) {
    return <EmptyState icon={<NotebookPen className="h-5 w-5" />} message="No notes yet" />;
  }
  return <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">{notes}</p>;
}

function Emails() {
  return <EmptyState icon={<Mail className="h-5 w-5" />} message="Email history coming soon" />;
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-sm text-slate-500">
      <span className="rounded-full bg-white p-3 text-slate-400">{icon}</span>
      {message}
    </div>
  );
}
