'use client';

import { useEffect, useState } from 'react';
import { Loader2, Copy, Check, Info, Eye, EyeOff } from 'lucide-react';
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
  const [showToken, setShowToken] = useState(false);

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
        
        // Get access token - try backend endpoint first (most reliable)
        console.log('=== TOKEN DEBUG ===');
        
        let token: string | null = null;
        
        // Method 1: Get token from backend API (most reliable - uses actual Authorization header)
        try {
          console.log('Trying backend endpoint /v1/auth/token...');
          token = await apiClient.getAccessToken();
          console.log('✅ Token from backend:', {
            length: token.length,
            startsWith: token.substring(0, 20),
            isValid: token.startsWith('eyJ') && token.length > 100
          });
        } catch (error) {
          console.warn('Backend endpoint failed, trying Supabase session:', error);
          
          // Method 2: Fallback to Supabase session
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session?.access_token) {
              token = sessionData.session.access_token;
              console.log('✅ Token from Supabase session:', {
                length: token.length,
                startsWith: token.substring(0, 20)
              });
            }
          } catch (sessionError) {
            console.error('❌ Both methods failed:', sessionError);
          }
        }
        
        // Validate and set token
        if (token) {
          if (token.startsWith('eyJ') && token.length > 100) {
            setRefreshToken(token);
            console.log('✅ Valid JWT token set successfully');
          } else {
            console.error('❌ Invalid token format:', {
              length: token.length,
              startsWith: token.substring(0, 10)
            });
            toast.error('Invalid token format. Please log out and log in again.');
          }
        } else {
          console.error('❌ No token available from any source');
          toast.error('Failed to get authentication token. Please log out and log in again.');
        }
        console.log('=== END DEBUG ===');
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
                  Copy this token and paste it into the Gmail add-on to connect your account.
                </p>
              </div>
              
              {refreshToken ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        readOnly
                        value={refreshToken}
                        className="font-mono text-xs pr-10"
                        type={showToken ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        aria-label={showToken ? "Hide token" : "Show token"}
                      >
                        {showToken ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
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
                      This is your authentication token that allows the Gmail add-on to sync with your account. 
                      The token expires after 1 hour, but the add-on will automatically refresh it in the background.
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
                <li>Copy the token above by clicking the &quot;Copy&quot; button</li>
                <li>Open Gmail and click the TrackMail add-on icon in the sidebar</li>
                <li>Click &quot;Get Started&quot; and then &quot;Paste Token&quot;</li>
                <li>Paste the token and click &quot;Connect&quot;</li>
                <li>That&apos;s it! The add-on will now work automatically forever</li>
              </ol>
            </div>

            <div className="flex items-start gap-3 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/30">
              <div className="text-blue-600 dark:text-blue-400">
                ℹ️
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Token Auto-Refresh
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  This token expires after 1 hour, but the add-on will automatically request a new one 
                  when needed. You&apos;ll stay connected as long as you remain logged in to TrackMail.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
