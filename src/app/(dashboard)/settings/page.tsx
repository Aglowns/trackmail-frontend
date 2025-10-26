'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { apiClient } from '@/lib/api';
import {
  UserProfile,
  UpdateUserProfileRequest,
} from '@/types/application';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name is too short').max(100).optional().or(z.literal('')),
  profession: z.string().max(120).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  notification_email: z.string().email('Enter a valid email').max(150).optional().or(z.literal('')),
  goals: z.string().max(500).optional().or(z.literal('')),
  job_preferences: z.object({
    preferred_roles: z.string().max(200).optional().or(z.literal('')),
    preferred_locations: z.string().max(200).optional().or(z.literal('')),
    salary_range: z.string().max(100).optional().or(z.literal('')),
  }).partial().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function mapProfileToForm(profile: UserProfile): ProfileFormValues {
  const preferences = (profile.job_preferences as Record<string, string>) || {};
  return {
    full_name: profile.full_name ?? '',
    profession: profile.profession ?? '',
    phone: profile.phone ?? '',
    notification_email: profile.notification_email ?? profile.email ?? '',
    goals: preferences.goals ?? '',
    job_preferences: {
      preferred_roles: preferences.preferred_roles ?? '',
      preferred_locations: preferences.preferred_locations ?? '',
      salary_range: preferences.salary_range ?? '',
    },
  };
}

function mapFormToPayload(values: ProfileFormValues): UpdateUserProfileRequest {
  const payload: UpdateUserProfileRequest = {
    full_name: values.full_name || undefined,
    profession: values.profession || undefined,
    phone: values.phone || undefined,
    notification_email: values.notification_email || undefined,
    job_preferences: {
      goals: values.goals || undefined,
      preferred_roles: values.job_preferences?.preferred_roles || undefined,
      preferred_locations: values.job_preferences?.preferred_locations || undefined,
      salary_range: values.job_preferences?.salary_range || undefined,
    },
  };

  // Clean undefined values inside job_preferences
  if (payload.job_preferences) {
    Object.keys(payload.job_preferences).forEach((key) => {
      const k = key as keyof typeof payload.job_preferences;
      if (!payload.job_preferences![k]) {
        delete payload.job_preferences![k];
      }
    });

    if (Object.keys(payload.job_preferences).length === 0) {
      payload.job_preferences = undefined;
    }
  }

  if (payload.notification_email === values.notification_email && !payload.notification_email) {
    delete payload.notification_email;
  }

  return payload;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      profession: '',
      phone: '',
      notification_email: '',
      goals: '',
      job_preferences: {
        preferred_roles: '',
        preferred_locations: '',
        salary_range: '',
      },
    },
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiClient.getCurrentProfile();
        setProfile(data);
        form.reset(mapProfileToForm(data));
      } catch (error) {
        console.error(error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [form]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      setSaving(true);
      const payload = mapFormToPayload(values);
      const updated = await apiClient.updateProfile(payload);
      setProfile(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your profile information, preferences, and notifications
        </p>
      </div>

      <Card className="border-none bg-white shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base font-semibold text-slate-900">
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-6">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <Form {...form}>
              <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Product Designer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notification_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification email</FormLabel>
                        <FormControl>
                          <Input placeholder="Where should updates go?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="job_preferences.preferred_roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred roles</FormLabel>
                        <FormControl>
                          <Input placeholder="Product Manager, UX Designer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="job_preferences.preferred_locations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred locations</FormLabel>
                        <FormControl>
                          <Input placeholder="Remote, New York, Berlin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="job_preferences.salary_range"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary expectations</FormLabel>
                        <FormControl>
                          <Input placeholder="$100k - $140k" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Career goals</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your goals for the next role"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => form.reset(mapProfileToForm(profile!))}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving
                      </span>
                    ) : (
                      'Save changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
