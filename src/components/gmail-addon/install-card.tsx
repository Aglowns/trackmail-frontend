import { Mail, Sparkles, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GmailAddonInstallCardProps {
  className?: string;
}

const DEFAULT_MARKETPLACE_URL =
  'https://workspace.google.com/marketplace/app/jobmail/'; // Replace with real marketplace URL when available

const DEFAULT_GMAIL_URL = 'https://mail.google.com';

export function GmailAddonInstallCard({ className }: GmailAddonInstallCardProps) {
  const marketplaceUrl = process.env.NEXT_PUBLIC_GMAIL_ADDON_URL ?? DEFAULT_MARKETPLACE_URL;
  const gmailUrl = process.env.NEXT_PUBLIC_GMAIL_URL ?? DEFAULT_GMAIL_URL;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-lg shadow-primary/10 dark:border-border/60 dark:bg-slate-950',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-60 blur-3xl dark:from-primary/25" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3 md:max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Gmail add-on
          </div>
          <h3 className="text-xl font-semibold text-foreground">Install the JobMail Gmail add-on</h3>
          <p className="text-sm text-muted-foreground">
            Track applications directly from Gmail, detect interviews and offers automatically, and sync everything to
            your JobMail dashboard—no copy-paste required.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <span>Track any email from Gmail in a single click.</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <span>AI detects interviews, offers, and rejections instantly.</span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
              <span>Secure—no inbox access beyond the email you open.</span>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-3 md:min-w-[220px]">
          <Button
            size="lg"
            className="w-full gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
            onClick={() => window.open(marketplaceUrl, '_blank', 'noopener')}
          >
            Install Add-on
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/10 dark:border-primary/30"
            onClick={() => window.open(gmailUrl, '_blank', 'noopener')}
          >
            Open Gmail
          </Button>
        </div>
      </div>
    </div>
  );
}

