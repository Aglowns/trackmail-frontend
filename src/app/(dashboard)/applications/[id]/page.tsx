'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar, Clock, Mail, NotebookPen, Plus, ArrowLeft } from 'lucide-react';

import { apiClient } from '@/lib/api';
import { Application, TimelineEvent, ApplicationStatus } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TabKey = 'timeline' | 'details' | 'notes' | 'emails';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'details', label: 'Details' },
  { key: 'notes', label: 'Notes' },
  { key: 'emails', label: 'Emails' },
];

const EVENT_TYPES = [
  { value: 'email_sent', label: 'Email Sent' },
  { value: 'email_received', label: 'Email Received' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'interview_completed', label: 'Interview Completed' },
  { value: 'offer_received', label: 'Offer Received' },
  { value: 'offer_accepted', label: 'Offer Accepted' },
  { value: 'offer_declined', label: 'Offer Declined' },
  { value: 'rejection', label: 'Rejection' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'note', label: 'Note' },
  { value: 'other', label: 'Other' },
];

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');
  const [loading, setLoading] = useState(true);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [eventFormData, setEventFormData] = useState({
    event_type: 'note',
    notes: '',
    event_date: '',
  });

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

  async function handleAddEvent() {
    if (!eventFormData.event_type || !eventFormData.notes.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const newEvent = await apiClient.createEvent({
        application_id: params.id,
        event_type: eventFormData.event_type,
        notes: eventFormData.notes,
        event_date: eventFormData.event_date || undefined,
      });
      setEvents([newEvent, ...events]);
      setEventDialogOpen(false);
      setEventFormData({ event_type: 'note', notes: '', event_date: '' });
      toast.success('Timeline event added successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add timeline event');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
        Loading application...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-xl border border-border p-6 text-center text-muted-foreground">
        Application not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" asChild className="px-0 text-muted-foreground hover:text-foreground">
            <Link href="/applications" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to applications
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{application.position}</h1>
            <p className="text-sm text-muted-foreground">{application.company}</p>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2" asChild>
          <Link href={`/applications/${application.id}/edit`}>
            <NotebookPen className="h-4 w-4" /> Edit Application
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="border-none shadow-sm">
          <CardContent className="space-y-6 p-4 sm:p-6">
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground">
                  {application.company?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-semibold">{application.company}</h2>
                  <p className="text-xs text-muted-foreground">{application.location ?? 'Location unknown'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm">
                <p className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                  <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold">
                    {application.status.replace('_', ' ')}
                  </span>
                </p>
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Applied {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : '—'}
                </p>
              </div>
            </section>

            <section className="space-y-3 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Confidence & Source
              </h3>
              <div className="space-y-2 rounded-xl border border-border bg-muted/50 p-4 text-sm">
                <p className="flex items-center justify-between">
                  Confidence
                  <span className="font-medium">{application.confidence ?? 'Not set'}</span>
                </p>
                <p className="flex items-center justify-between">
                  Source
                  <span className="font-medium">{application.source ?? '—'}</span>
                </p>
                <p className="flex items-center justify-between">
                  Salary Range
                  <span className="font-medium">{application.salary_range ?? '—'}</span>
                </p>
              </div>
            </section>

            {application.notes && (
              <section className="space-y-3 text-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes
                </h3>
                <p className="rounded-xl border border-border bg-muted/50 p-4 text-sm">
                  {application.notes}
                </p>
              </section>
            )}

            <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Timeline Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Timeline Event</DialogTitle>
                  <DialogDescription>
                    Record an important milestone or interaction for this application.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event_type">Event Type</Label>
                    <Select 
                      value={eventFormData.event_type} 
                      onValueChange={(value) => setEventFormData(prev => ({ ...prev, event_type: value }))}
                    >
                      <SelectTrigger id="event_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="event_date">Event Date (Optional)</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={eventFormData.event_date}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, event_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes *</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add details about this event..."
                      value={eventFormData.notes}
                      onChange={(e) => setEventFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setEventDialogOpen(false);
                    setEventFormData({ event_type: 'note', notes: '', event_date: '' });
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent} disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Event'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 sm:px-6 overflow-x-auto">
              <div className="flex min-w-[320px] gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`border-b-2 px-2 py-4 text-sm font-medium transition ${
                      activeTab === tab.key
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
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
      <div className="rounded-xl border border-border bg-muted/50 p-6 text-sm text-muted-foreground">
        No timeline events yet. Add events to track progress.
      </div>
    );
  }

  return (
    <ol className="space-y-6">
      {events.map((event) => (
        <li key={event.id} className="relative flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1 rounded-xl border border-border bg-card p-4 text-sm">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              <span>{event.event_type.replace('_', ' ')}</span>
              <span>{new Date(event.created_at).toLocaleString()}</span>
            </div>
            {event.status && (
              <div className="text-xs text-muted-foreground">Status: {event.status.replace('_', ' ')}</div>
            )}
            {event.notes && <p className="text-sm">{event.notes}</p>}
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
      <InfoBlock 
        title="Source" 
        value={application.source ?? '—'} 
        icon={<Mail className="h-4 w-4" />}
        url={application.source_url}
      />
      <InfoBlock title="Applied Date" value={application.applied_at ? new Date(application.applied_at).toLocaleDateString() : '—'} icon={<Calendar className="h-4 w-4" />} />
    </div>
  );
}

function InfoBlock({ title, value, icon, url }: { title: string; value: string; icon: React.ReactNode; url?: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </p>
      {url && value !== '—' ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-2 text-sm font-medium text-primary hover:underline block break-all"
        >
          {value}
        </a>
      ) : (
        <p className="mt-2 text-sm font-medium">{value}</p>
      )}
    </div>
  );
}

function Notes({ notes }: { notes?: string }) {
  if (!notes) {
    return <EmptyState icon={<NotebookPen className="h-5 w-5" />} message="No notes yet" />;
  }
  return <p className="rounded-xl border border-border bg-muted/50 p-4 text-sm">{notes}</p>;
}

function Emails() {
  return <EmptyState icon={<Mail className="h-5 w-5" />} message="Email history coming soon" />;
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/50 p-10 text-sm text-muted-foreground">
      <span className="rounded-full bg-card p-3 text-muted-foreground">{icon}</span>
      {message}
    </div>
  );
}
