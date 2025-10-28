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
import toast from 'react-hot-toast';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name is too short').max(100).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function mapProfileToForm(profile: UserProfile): ProfileFormValues {
  return {
    full_name: profile.full_name ?? '',
    phone: profile.phone ?? '',
  };
}

function mapFormToPayload(values: ProfileFormValues): UpdateUserProfileRequest {
  const payload: UpdateUserProfileRequest = {
    full_name: values.full_name || undefined,
    phone: values.phone || undefined,
  };

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
      phone: '',
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
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">
          Manage your profile information, preferences, and notifications
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your name" />
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
                          <Input {...field} placeholder="Contact number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={saving}
                  >
                    Reset
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
