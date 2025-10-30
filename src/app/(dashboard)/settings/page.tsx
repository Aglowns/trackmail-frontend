'use client';

import { useEffect, useState } from 'react';
import { Loader2, Copy, Check, Info } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { apiClient } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import {
  UserProfile,
  UpdateUserProfileRequest,
} from '@/types/application';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [isEditing, setIsEditing] = useState(false);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: '',
      phone: '',
    },
  });

  const { isDirty, isValid } = form.formState;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiClient.getCurrentProfile();
        setProfile(data);
        form.reset(mapProfileToForm(data));
        setIsEditing(false);
        
        // Get refresh token from Supabase session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.refresh_token) {
          setRefreshToken(sessionData.session.refresh_token);
        }
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
      form.reset(mapProfileToForm(updated));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit() {
    if (profile) {
      form.reset(mapProfileToForm(profile));
    }
    setIsEditing(true);
  }

  function handleCancel() {
    if (profile) {
      form.reset(mapProfileToForm(profile));
    } else {
      form.reset({ full_name: '', phone: '' });
    }
    setIsEditing(false);
  }

  async function handleCopyToken() {
    if (!refreshToken) return;
    
    try {
      await navigator.clipboard.writeText(refreshToken);
      setTokenCopied(true);
      toast.success('Token copied to clipboard!');
      
      // Reset copied state after 3 seconds
      setTimeout(() => setTokenCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy token:', error);
      toast.error('Failed to copy token');
    }
  }

  const displayName = profile?.full_name?.trim() || 'Add your name';
  const displayPhone = profile?.phone?.trim() || 'Add your phone number';
  const lastUpdated = profile?.updated_at
    ? new Date(profile.updated_at).toLocaleString()
    : null;

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
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Keep your contact details accurate so recruiters can reach you.
              </CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={handleEdit} disabled={!!saving || !profile}>
                Edit profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
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

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving || !isDirty || !isValid}>
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
            ) : (
              <div className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Full name
                    </p>
                    <p className="mt-2 text-lg font-medium text-foreground">{displayName}</p>
                  </div>
                  <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Phone number
                    </p>
                    <p className="mt-2 text-lg font-medium text-foreground">{displayPhone}</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-xl bg-muted/60 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">Need to make a change?</p>
                    <p className="text-sm text-muted-foreground">
                      You can update your details at any time. Changes take effect immediately after saving.
                    </p>
                  </div>
                  <Button onClick={handleEdit} variant="default">
                    Edit profile
                  </Button>
                </div>

                {lastUpdated && (
                  <p className="text-xs text-muted-foreground">
                    Last updated {lastUpdated}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gmail Add-on Integration Section */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle>Gmail Add-on Integration</CardTitle>
            <CardDescription>
              Connect your Gmail account to automatically track job application emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2">
                <p className="text-sm font-medium text-foreground">Your Connection Token</p>
                <p className="text-sm text-muted-foreground">
                  Copy this token and paste it into the Gmail add-on to connect your account. <strong>You only need to do this once!</strong>
                </p>
              </div>
              
              {refreshToken ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={refreshToken}
                      className="font-mono text-xs"
                      type="password"
                    />
                    <Button onClick={handleCopyToken} variant="outline" size="default">
                      {tokenCopied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      This token allows the Gmail add-on to automatically sync your job application emails. 
                      It refreshes itself automatically, so you never have to do this again after the initial setup.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading token...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-muted/60 p-5">
              <p className="mb-2 text-sm font-medium text-foreground">Setup Instructions:</p>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Copy the token above by clicking the "Copy" button</li>
                <li>Open Gmail and click the TrackMail add-on icon in the sidebar</li>
                <li>Click "Get Started" and then "Paste Token"</li>
                <li>Paste the token and click "Connect"</li>
                <li>That's it! The add-on will now work automatically forever</li>
              </ol>
            </div>

            <div className="flex items-start gap-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-950/30">
              <div className="text-emerald-600 dark:text-emerald-400">
                ✨
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  One-time setup, works forever!
                </p>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                  After connecting once, the token automatically refreshes itself in the background. 
                  You'll never need to copy it again unless you disconnect the add-on.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
