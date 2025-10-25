'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Application, CreateApplicationRequest, ApplicationStatus } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const applicationSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  status: z.enum([
    'applied',
    'interview_scheduled',
    'interview_completed',
    'offer_received',
    'rejected',
    'withdrawn',
    'screening',
    'interviewing',
    'offer',
    'accepted'
  ]),
  location: z.string().optional(),
  source_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'interview_completed', label: 'Interview Completed' },
  { value: 'offer_received', label: 'Offer Received' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
];

interface ApplicationFormProps {
  application?: Application;
  onSubmit: (data: CreateApplicationRequest) => Promise<void>;
  loading?: boolean;
  submitText?: string;
}

export function ApplicationForm({ 
  application, 
  onSubmit, 
  loading = false, 
  submitText = 'Create Application' 
}: ApplicationFormProps) {
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: application?.company || '',
      position: application?.position || '',
      status: application?.status || 'applied',
      location: application?.location || '',
      source_url: application?.source_url || '',
      notes: application?.notes || '',
    },
  });

  const handleSubmit = async (data: ApplicationFormData) => {
    const submitData: CreateApplicationRequest = {
      company: data.company,
      position: data.position,
      status: data.status,
      location: data.location || undefined,
      source_url: data.source_url || undefined,
      notes: data.notes || undefined,
    };
    await onSubmit(submitData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {application ? 'Edit Application' : 'New Application'}
        </CardTitle>
        <CardDescription>
          {application 
            ? 'Update your job application details' 
            : 'Add a new job application to track'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="source_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Posting URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="https://company.com/jobs/position" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes about this application..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : submitText}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
