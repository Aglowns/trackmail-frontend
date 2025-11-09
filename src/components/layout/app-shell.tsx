'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  BarChart2,
  CreditCard,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Applications', href: '/applications', icon: Briefcase },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { label: 'Subscription', href: '/subscription', icon: CreditCard },
  { label: 'Settings', href: '/settings', icon: SettingsIcon },
];

function initialsFromEmail(email?: string | null) {
  if (!email) return 'U';
  const letter = email.trim().charAt(0);
  return letter ? letter.toUpperCase() : 'U';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
      }
    }

    if (mobileNavOpen) {
      window.addEventListener('keydown', handleKeydown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [mobileNavOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/applications?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/applications');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen md:pl-64">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/60 bg-card/90 shadow-lg md:flex">
          <div className="flex h-full flex-col">
            <div className="px-6 pb-2 pt-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xl font-semibold tracking-tight text-primary"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                  JM
                </span>
                <span className="font-semibold text-foreground">
                  Job<span className="text-primary">Mail</span>
                </span>
              </Link>
            </div>

            <nav className="mt-6 flex-1 overflow-y-auto px-6 pb-6 text-sm font-medium">
              {navItems.map(({ label, href, icon: Icon }) => {
                const isActive =
                  pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 transition',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-4 border-t border-border/60 bg-card/75 px-6 pb-6 pt-5 text-sm backdrop-blur">
              <div className="rounded-lg border border-border/60 bg-background/90 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">
                  {user?.email ?? 'Signed in'}
                </p>
                <p className="text-xs text-muted-foreground/80">
                  Manage your account and preferences.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/90 px-3 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>

              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border/60 bg-card/80 backdrop-blur">
            <div className="flex h-16 items-center gap-4 px-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-border p-2 text-muted-foreground transition hover:border-primary/40 hover:text-foreground md:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary md:hidden"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                  JM
                </span>
                <span className="font-semibold text-foreground">
                  Job<span className="text-primary">Mail</span>
                </span>
              </Link>

              <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
                <div className="relative w-full max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-full rounded-full border border-border bg-muted/70 pl-10 text-sm text-foreground placeholder:text-muted-foreground/70"
                  />
                </div>
              </form>

              <div className="ml-auto flex items-center gap-3">
                <div className="md:hidden">
                  <ThemeToggle />
                </div>
                <ProfileMenu email={user?.email} onSignOut={handleSignOut} />
              </div>
            </div>
          </header>

          {mobileNavOpen && (
            <MobileNav
              navItems={navItems}
              pathname={pathname}
              onClose={() => setMobileNavOpen(false)}
              onNavigate={(href) => {
                router.push(href);
                setMobileNavOpen(false);
              }}
              email={user?.email}
              onSignOut={handleSignOut}
            />
          )}

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-secondary/40 to-background">
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-12">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

interface MobileNavProps {
  navItems: NavItem[];
  pathname: string | null;
  onClose: () => void;
  onNavigate: (href: string) => void;
  email?: string | null;
  onSignOut: () => Promise<void> | void;
}

function MobileNav({
  navItems,
  pathname,
  onClose,
  onNavigate,
  email,
  onSignOut,
}: MobileNavProps) {
  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div className="h-full w-72 border-r border-border/60 bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-primary"
            onClick={() => onNavigate('/dashboard')}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              JM
            </span>
            <span className="font-semibold text-foreground">
              Job<span className="text-primary">Mail</span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-1 text-sm font-medium">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));
            return (
              <button
                key={href}
                type="button"
                onClick={() => onNavigate(href)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-left transition',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 space-y-4 text-sm">
          <div className="rounded-lg border border-border/60 bg-card p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account
            </p>
            <p className="mt-1 truncate text-sm font-medium text-foreground">{email ?? 'Signed in'}</p>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={async () => {
              await onSignOut();
              onClose();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
      <button
        type="button"
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close navigation overlay"
      />
    </div>
  );
}

function ProfileMenu({
  email,
  onSignOut,
}: {
  email?: string | null;
  onSignOut: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const initials = initialsFromEmail(email);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1 pl-1 pr-3 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
          {initials}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card p-2 text-sm shadow-lg">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </p>
          <div className="rounded-lg p-2 text-muted-foreground">
            <p className="truncate text-sm font-medium text-foreground">{email ?? 'Account'}</p>
            <p className="text-xs text-muted-foreground/80">Signed in</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-1 w-full border-border text-foreground hover:bg-muted"
            onClick={async () => {
              await onSignOut();
              setOpen(false);
            }}
          >
            Sign out
          </Button>
        </div>
      )}
    </div>
  );
}
