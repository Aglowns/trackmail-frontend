'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Copy, Check, RefreshCw, ArrowLeft } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const cardStyles =
  'group relative overflow-hidden border border-border/60 bg-card/80 shadow-2xl shadow-primary/20';
const overlayStyles =
  'pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100';

export default function GmailTokenPage() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        const gmailToken = `gmail_${user.id}_${Date.now()}`;
        setToken(gmailToken);
      } else {
        router.push('/login?redirect=/gmail-token');
      }
      setLoading(false);
    });
  }, [router]);

  const copyToClipboard = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy token', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/10 to-background px-4">
        <Card className={`${cardStyles} max-w-md w-full`}>
          <div className={overlayStyles} />
          <CardHeader className="relative space-y-2 text-center">
            <CardTitle className="text-2xl">Sign in required</CardTitle>
            <CardDescription>
              You need to sign in before generating a Gmail token. We&apos;ll bring you back here after login.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex flex-col gap-3">
            <Button onClick={() => router.push('/login')} className="w-full shadow-md shadow-primary/20">
              Go to login
            </Button>
            <Button
              variant="outline"
              className="w-full border border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/10 to-background px-4 py-12">
      <Card className={`${cardStyles} w-full max-w-lg`}>
        <div className={overlayStyles} />
        <CardHeader className="relative space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl">Gmail Add-on Token</CardTitle>
          <CardDescription>
            Copy this secure token into the JobMail Gmail add-on to connect your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Your one-time token</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={token}
                readOnly
                className="flex-1 bg-background/80 font-mono text-xs"
              />
              <Button
                variant="outline"
                className="flex items-center gap-2 border border-primary/30 text-primary hover:bg-primary/10"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy token
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/40 p-5 text-sm">
            <p className="mb-3 font-medium text-foreground">How to use it</p>
            <ol className="space-y-2 text-muted-foreground">
              <li>1. Copy the token above</li>
              <li>2. Open Gmail and select any job-related email</li>
              <li>3. Launch the JobMail add-on from the sidebar</li>
              <li>4. Choose <strong>Paste Token</strong> and drop this value in</li>
              <li>5. Hit connect — new applications will sync automatically</li>
            </ol>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              Keep this token private. If you ever need to regenerate it, just refresh this page and we&apos;ll create a brand new secure token for you.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 border border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to dashboard
            </Button>
            <Button
              className="flex-1 shadow-md shadow-primary/20"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Generate new token
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
