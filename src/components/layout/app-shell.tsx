'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Search, ChevronDown, Menu, X } from 'lucide-react';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Applications', href: '/applications' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Settings', href: '/settings' },
];

const professionOptions = [
  'All Professions',
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Operations',
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
  const [profession, setProfession] = useState(professionOptions[0]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight sm:text-2xl">
            TrackMail
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 md:hidden"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            {navItems.map(({ label, href }) => {
              const isActive =
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`transition hover:text-slate-900 ${
                    isActive ? 'text-slate-900' : 'text-slate-600'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex flex-1 items-center justify-end gap-3">
            <div className="relative hidden max-w-sm flex-1 items-center md:flex">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search applications..."
                className="w-full rounded-full border-slate-200 bg-slate-100/80 pl-10 text-sm"
              />
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Select value={profession} onValueChange={setProfession}>
                <SelectTrigger className="w-40 rounded-full border-slate-200 bg-slate-100/80 text-sm font-medium text-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-sm">
                  {professionOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ThemeToggle />

            <ProfileMenu
              email={user?.email}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm md:hidden">
          <div className="absolute inset-x-4 top-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Navigation</p>
                <nav className="flex flex-col gap-1 text-sm">
                  {navItems.map(({ label, href }) => {
                    const isActive =
                      pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`rounded-lg px-3 py-2 transition ${
                          isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Profession Filter
                </p>
                <Select value={profession} onValueChange={setProfession}>
                  <SelectTrigger className="w-full rounded-full border-slate-200 bg-slate-100/80 text-sm font-medium text-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-sm">
                    {professionOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Account
                </p>
                <p className="truncate text-sm font-medium text-slate-900">{user?.email ?? 'Signed in'}</p>
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-100"
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
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 pl-1 pr-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {initials}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-2 text-sm shadow-lg">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Account
          </p>
          <div className="rounded-lg p-2 text-slate-600">
            <p className="truncate text-sm font-medium text-slate-900">{email ?? 'Account'}</p>
            <p className="text-xs text-slate-500">Signed in</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-1 w-full border-slate-200 text-slate-700 hover:bg-slate-100"
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
