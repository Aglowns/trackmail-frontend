'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import Image from 'next/image';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Applications', href: '/applications' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Settings', href: '/settings' },
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/applications?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/applications');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold tracking-tight sm:text-2xl">
            <Image src="/logo.svg" alt="Jobmail" width={120} height={40} className="h-8 w-auto" priority />
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-border p-2 text-muted-foreground transition hover:border-primary/40 hover:text-foreground md:hidden"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            {navItems.map(({ label, href }) => {
              const isActive =
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`transition hover:text-foreground ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex flex-1 items-center justify-end gap-3">
            <form onSubmit={handleSearch} className="relative hidden max-w-sm flex-1 items-center md:flex">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Search applications..."
                className="w-full rounded-full border border-border bg-muted/70 pl-10 text-sm text-foreground placeholder:text-muted-foreground/70"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <ThemeToggle />

            <ProfileMenu
              email={user?.email}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="absolute inset-x-4 top-20 rounded-2xl border border-border bg-card p-4 shadow-xl">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</p>
                <nav className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {navItems.map(({ label, href }) => {
                    const isActive =
                      pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`rounded-lg px-3 py-2 transition ${
                          isActive ? 'bg-muted text-foreground' : 'hover:bg-muted'
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-2 rounded-xl border border-border p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </p>
                <p className="truncate text-sm font-medium text-foreground">{user?.email ?? 'Signed in'}</p>
                <Button
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-muted"
                  onClick={async () => {
                    await handleSignOut();
                    setMobileNavOpen(false);
                  }}
                >
                  Sign out
                </Button>
                <div className="pt-2">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
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
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card p-2 text-sm shadow-lg">
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
