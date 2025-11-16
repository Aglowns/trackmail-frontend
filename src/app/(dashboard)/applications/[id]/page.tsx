'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Calendar, Clock, Mail, NotebookPen, Plus, ArrowLeft, MailPlus, PhoneCall, PartyPopper } from 'lucide-react';

import { apiClient } from '@/lib/api';
import { Application, TimelineEvent, ApplicationStatus } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { GmailAddonInstallCard } from '@/components/gmail-addon/install-card';

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

const detailCardStyles =
  'group relative overflow-hidden border border-border/60 bg-card/80 shadow-lg shadow-primary/5 transition duration-300 hover:-translate-y-1 hover:shadow-primary/20';
const detailOverlayStyles =
  'pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100';

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');
  const [loading, setLoading] = useState(true);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<ApplicationStatus | null>(null);
  
  const [eventFormData, setEventFormData] = useState({
    event_type: 'note',
    notes: '',
    event_date: '',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Batch API calls in parallel for faster loading
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
  async function handleStatusUpdate(nextStatus: ApplicationStatus) {
    if (!application) return;

    try {
      setUpdatingStatus(nextStatus);
      const updated = await apiClient.updateApplication(application.id, { status: nextStatus });
      setApplication(updated);
      toast.success(`Status updated to ${nextStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  }

  const isGmailSource = application?.source?.toLowerCase().includes('gmail');

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
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/80 text-muted-foreground">
        Loading application...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/80 p-6 text-center text-muted-foreground">
        Application not found.
      </div>
    );
  }

  const isGmailSource = application.source?.toLowerCase().includes('gmail');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button variant="ghost" asChild className="px-0 text-muted-foreground hover:text-foreground">
            <Link href="/applications" className="flex items-center gap-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to applications
            </Link>
          </Button>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">{application.position}</h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {application.company}
              {isGmailSource && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  <MailPlus className="h-3 w-3" />
                  Tracked via Gmail
                </span>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 border border-primary/30 text-primary shadow-md shadow-primary/20 hover:bg-primary/10"
          asChild
        >
          <Link href={`/applications/${application.id}/edit`}>
            <NotebookPen className="h-4 w-4" /> Edit Application
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className={detailCardStyles}>
          <div className={detailOverlayStyles} />
          <CardContent className="relative space-y-6 p-4 sm:p-6">
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                  {application.company?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-semibold">{application.company}</h2>
                  <p className="text-xs text-muted-foreground">{application.location ?? 'Location unknown'}</p>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                  <span>Status</span>
                  <StatusBadge status={application.status} className="px-2 py-1 text-[11px]" />
                </div>
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
              <div className="space-y-2 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm">
                <p className="flex items-center justify-between">
                  Confidence
                  <span className="font-medium text-foreground">{application.confidence ?? 'Not set'}</span>
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span>Source</span>
                  {isGmailSource ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      <MailPlus className="h-3 w-3" />
                      Gmail add-on
                    </span>
                  ) : (
                    <span className="font-medium text-foreground">{application.source ?? '—'}</span>
                  )}
                </div>
                <p className="flex items-center justify-between">
                  Salary Range
                  <span className="font-medium text-foreground">{application.salary_range ?? '—'}</span>
                </p>
              </div>
            </section>

            {isGmailSource && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-primary">
                Automatically captured from the JobMail Gmail add-on. Keep opening emails in Gmail to stay in sync.
              </div>
            )}

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
                <Button
                  variant="outline"
                  className="w-full items-center gap-2 border border-primary/30 text-primary shadow-md shadow-primary/20 hover:bg-primary/10"
                >
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

        <div className="flex flex-col gap-6">
          <Card className={detailCardStyles}>
            <div className={detailOverlayStyles} />
            <CardContent className="space-y-4 p-4 sm:p-6">
              <section className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">Quick status update</h2>
                <p className="text-xs text-muted-foreground">
                  Adjust the stage directly from here to keep your pipeline in sync with Gmail.
                </p>
              </section>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="justify-start gap-2 border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() => handleStatusUpdate('interview_scheduled')}
                  disabled={updatingStatus === 'interview_scheduled'}
                >
                  {updatingStatus === 'interview_scheduled' ? (
                    <>Updating…</>
                  ) : (
                    <>
                      <PhoneCall className="h-4 w-4" />
                      Mark interview scheduled
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 border-emerald-400/40 text-emerald-600 hover:bg-emerald-500/10"
                  onClick={() => handleStatusUpdate('offer_received')}
                  disabled={updatingStatus === 'offer_received'}
                >
                  {updatingStatus === 'offer_received' ? (
                    <>Updating…</>
                  ) : (
                    <>
                      <PartyPopper className="h-4 w-4" />
                      Mark offer received
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 border-rose-400/40 text-rose-600 hover:bg-rose-500/10"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updatingStatus === 'rejected'}
                >
                  {updatingStatus === 'rejected' ? (
                    <>Updating…</>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Mark as rejection
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 border-sky-400/40 text-sky-600 hover:bg-sky-500/10"
                  onClick={() => handleStatusUpdate('applied')}
                  disabled={updatingStatus === 'applied'}
                >
                  {updatingStatus === 'applied' ? (
                    <>Updating…</>
                  ) : (
                    <>
                      <NotebookPen className="h-4 w-4" />
                      Reset to applied
                    </>
                  )}
                </Button>
              </div>

              {isGmailSource && (
                <AlertFooterCard />
              )}
            </CardContent>
          </Card>

          {!isGmailSource && (
            <GmailAddonInstallCard className="hidden border-dashed border-primary/40 bg-background/80 lg:block" />
          )}
        </div>

        <Card className={detailCardStyles}>
          <div className={detailOverlayStyles} />
          <CardContent className="relative p-0">
            <div className="overflow-x-auto border-b border-border/60 px-4 sm:px-6">
              <div className="flex min-w-[320px] gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`border-b-2 px-2 py-4 text-sm font-medium transition ${
                      activeTab === tab.key
                        ? 'border-primary text-primary'
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
      <div className="rounded-xl border border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
        No timeline events yet. Add events to track progress.
      </div>
    );
  }

  return (
    <ol className="space-y-6">
      {events.map((event) => (
        <li key={event.id} className="relative flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-1 rounded-xl border border-border/60 bg-card/80 p-4 text-sm shadow-sm">
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
    <div className="rounded-xl border border-border/60 bg-card/80 p-4 text-sm shadow-sm">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block break-all text-sm font-medium text-primary hover:text-primary/80"
        >
          {value !== '—' ? value : 'Link'}
        </a>
      ) : (
        <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
      )}
    </div>
  );
}

function Notes({ notes }: { notes?: string }) {
  if (!notes) {
    return <EmptyState icon={<NotebookPen className="h-5 w-5" />} message="No notes yet" />;
  }
  return <p className="rounded-xl border border-border/60 bg-card/80 p-4 text-sm shadow-sm">{notes}</p>;
}

function Emails() {
  return <EmptyState icon={<Mail className="h-5 w-5" />} message="Email history coming soon" />;
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/40 p-10 text-sm text-muted-foreground">
      <span className="rounded-full bg-card/80 p-3 text-muted-foreground">{icon}</span>
      {message}
    </div>
  );
}

function AlertFooterCard() {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary">
      Status updates here will be reflected the next time you open the email in Gmail.
    </div>
  );
}
