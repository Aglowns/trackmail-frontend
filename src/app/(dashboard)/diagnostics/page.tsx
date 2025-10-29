'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { supabase } from '@/lib/supabase';

type CheckResult = {
  name: string;
  ok: boolean;
  details?: string;
};

export default function DiagnosticsPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);

  async function runChecks() {
    setRunning(true);
    const checks: CheckResult[] = [];
    try {
      // 1) Health (versioned)
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/v1/health`;
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        checks.push({ name: 'Backend /health', ok: res.ok, details: JSON.stringify(data) });
      } catch (e: unknown) {
        checks.push({ name: 'Backend /health', ok: false, details: String(e) });
      }

      // 2) Auth token presence
      try {
        const { data } = await supabase.auth.getSession();
        const ok = Boolean(data.session?.access_token);
        checks.push({ name: 'Auth session token', ok, details: ok ? 'token present' : 'no token' });
      } catch (e: unknown) {
        checks.push({ name: 'Auth session token', ok: false, details: String(e) });
      }

      // 3) Profile
      try {
        const profile = await apiClient.getCurrentProfile();
        checks.push({ name: 'GET /v1/profiles/me', ok: true, details: profile.email });
      } catch (e: unknown) {
        checks.push({ name: 'GET /v1/profiles/me', ok: false, details: String(e) });
      }

      // 4) Applications grouped
      try {
        const grouped = await apiClient.getApplicationsByStatus();
        const keys = Object.keys(grouped).join(', ');
        checks.push({ name: 'GET /v1/applications/status-groups', ok: true, details: keys });
      } catch (e: unknown) {
        checks.push({ name: 'GET /v1/applications/status-groups', ok: false, details: String(e) });
      }
    } finally {
      setResults(checks);
      setRunning(false);
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const total = results.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Diagnostics</h1>
        <p className="text-sm text-muted-foreground">Run quick checks to verify the frontend, backend, and auth are wired correctly.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Live Checks</CardTitle>
          <Button onClick={runChecks} disabled={running} className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {running ? 'Running...' : 'Run checks'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              Passed {okCount}/{total}
            </p>
          )}

          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.name} className="flex items-start gap-3 rounded-lg border border-border p-3">
                {r.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 text-rose-500" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.name}</p>
                  {r.details && (
                    <p className="truncate text-xs text-muted-foreground">{r.details}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


