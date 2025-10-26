'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Mail,
  Sparkles,
  KanbanSquare,
  BarChart3,
  CalendarClock,
  ShieldCheck,
  LockKeyhole,
  UserCheck,
  Database,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';

const features: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: 'Auto-ingest from Gmail',
    description:
      'Automatically detect job application emails, capture attachments, and extract key details without lifting a finger.',
    icon: Mail,
  },
  {
    title: 'Smart Parsing',
    description:
      'Extract company, role, location, and dates from any email format using our ultra-accurate parsing engine.',
    icon: Sparkles,
  },
  {
    title: 'Kanban + List Views',
    description:
      'Organize applications with drag-and-drop kanban boards or detailed list views tailored to your workflow.',
    icon: KanbanSquare,
  },
  {
    title: 'Analytics & Timelines',
    description:
      'Track interviews, offers, and response times with powerful analytics and email-linked timelines.',
    icon: BarChart3,
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Connect Gmail',
    description:
      'Securely sign in with Google and grant read-only access in under a minute. No forwarding rules required.',
  },
  {
    step: 2,
    title: 'We detect emails',
    description:
      'Our AI scans your inbox for job-related emails, parses critical information, and creates clean application records.',
  },
  {
    step: 3,
    title: 'Dashboard updates',
    description:
      'Review your kanban board or detailed lists, trigger reminders, and keep every opportunity organized automatically.',
  },
];

const pricingPlans: Array<{
  name: string;
  badge?: string;
  price: { monthly: number; annual: number };
  description: string;
  perks: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
}> = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for kickstarting your search without manual spreadsheets.',
    perks: ['Up to 50 applications', 'Basic email parsing', 'Kanban board'],
    ctaLabel: 'Get Started',
    ctaHref: '/signup',
  },
  {
    name: 'Pro',
    badge: 'Most Popular',
    price: { monthly: 12, annual: 120 },
    description: 'Automation and insights for serious job seekers and career switchers.',
    perks: [
      'Unlimited applications',
      'Advanced AI parsing',
      'Analytics & insights',
      'Email reminders',
    ],
    ctaLabel: 'Start Free Trial',
    ctaHref: '/signup',
    highlight: true,
  },
  {
    name: 'Team',
    price: { monthly: 29, annual: 288 },
    description: 'Manage a coaching business or bootcamp cohort with collaborative tools.',
    perks: [
      'Everything in Pro',
      'Team collaboration',
      'Shared templates',
      'Priority support',
    ],
    ctaLabel: 'Contact Sales',
    ctaHref: 'mailto:hello@trackmail.app',
  },
];

const securityFeatures: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: 'Supabase RLS',
    description: 'Row-level security keeps each candidate’s data fully isolated and encrypted.',
    icon: ShieldCheck,
  },
  {
    title: 'Minimal Permissions',
    description: 'Read-only Gmail scopes ensure TrackMail never sends emails on your behalf.',
    icon: LockKeyhole,
  },
  {
    title: 'User Control',
    description: 'Adjust data retention and privacy settings at any time from the dashboard.',
    icon: UserCheck,
  },
  {
    title: 'Data Retention',
    description: 'Transparent policies with user-defined retention so your data never lingers longer than needed.',
    icon: Database,
  },
];

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Security', href: '#security' },
    { label: 'Changelog', href: 'https://github.com/' },
  ],
  resources: [
    { label: 'Documentation', href: '#docs' },
    { label: 'API Reference', href: '#docs' },
    { label: 'Help Center', href: '#docs' },
    { label: 'Community', href: '#docs' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Contact', href: 'mailto:hello@trackmail.app' },
  ],
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur transition-colors dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-semibold tracking-tight sm:text-2xl">
            TrackMail
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 transition md:flex dark:text-slate-300">
            <Link href="#features" className="transition hover:text-slate-900 dark:hover:text-white">
              Features
            </Link>
            <Link href="#pricing" className="transition hover:text-slate-900 dark:hover:text-white">
              Pricing
            </Link>
            <Link href="#security" className="transition hover:text-slate-900 dark:hover:text-white">
              Security
            </Link>
            <Link href="#docs" className="transition hover:text-slate-900 dark:hover:text-white">
              Docs
            </Link>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Button asChild size="sm" className="shadow-sm">
              <Link href="/signup">Start Free</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              onClick={() => setNavOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {navOpen && (
          <div className="border-t border-slate-200/60 bg-white/90 px-4 py-4 shadow-lg transition-colors dark:border-slate-800/80 dark:bg-slate-950/95 md:hidden">
            <nav className="flex flex-col gap-3 text-sm font-medium text-slate-600 dark:text-slate-200">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Security', href: '#security' },
                { label: 'Docs', href: '#docs' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 transition hover:bg-slate-100 dark:hover:bg-slate-900"
                  onClick={() => setNavOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                onClick={() => setNavOpen(false)}
              >
                Sign In
              </Link>
              <Button asChild onClick={() => setNavOpen(false)}>
                <Link href="/signup">Start Free</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="bg-white/70 transition-colors dark:bg-slate-900/40">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:py-28 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-32 lg:px-8">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <Sparkles className="h-3.5 w-3.5" /> Gmail add-on + smart parsing
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 transition dark:text-white sm:text-4xl md:text-5xl">
                Track your job applications automatically
              </h1>
              <p className="text-base text-slate-600 transition dark:text-slate-300 sm:text-lg">
                TrackMail ingests job-related emails, builds a kanban-ready dashboard, and nudges you with analytics & reminders so you never lose another opportunity.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="shadow-sm">
                  <Link href="/signup" className="flex items-center gap-2">
                    Start Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-slate-200 bg-white">
                  <Link href="#demo" className="flex items-center gap-2">
                    See Demo
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Read-only Gmail permissions
                </li>
                <li className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-indigo-500" />
                  Reminders & analytics built in
                </li>
              </ul>
            </div>
            <div className="relative animate-in fade-in slide-in-from-bottom-6">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-200 p-2 shadow-xl shadow-slate-900/5 transition dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-900/5 text-sm font-medium text-slate-400 transition dark:bg-slate-900/20 dark:text-slate-500">
                  Gmail Sidebar + Dashboard Preview
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 transition dark:text-white sm:text-3xl">
              Everything you need to track applications
            </h2>
            <p className="mt-3 text-base text-slate-600 transition dark:text-slate-300 sm:text-lg">
              Automate your job search workflow with intelligent email parsing and collaborative views.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {features.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/5 dark:bg-slate-700/20">
                  <Icon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-white/60">
          <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                How it works
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Get started in minutes with our simple three-step process.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {howItWorks.map((item) => (
                <div key={item.step} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-8">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/5 text-sm font-semibold text-slate-700">
                    {item.step}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 text-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 transition dark:text-white sm:text-3xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-base text-slate-600 transition dark:text-slate-300 sm:text-lg">
                Choose the plan that works best for you and upgrade anytime.
              </p>
            </div>
            <div className="mx-auto flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-600 transition dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full px-4 py-2 transition ${
                  billingCycle === 'monthly'
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`rounded-full px-4 py-2 transition ${
                  billingCycle === 'annual'
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Annual
              </button>
            </div>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => {
              const price = plan.price[billingCycle];
              const isFree = price === 0;
              return (
                <div
                  key={plan.name}
                  className={`flex h-full flex-col rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                    plan.highlight ? 'ring-2 ring-indigo-100 dark:ring-indigo-400/40' : 'dark:border-slate-800 dark:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                    {plan.badge && (
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-slate-900 dark:text-white">
                      {isFree ? '$0' : `$${price}`}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-300">
                      {billingCycle === 'monthly' ? '/month' : '/month (billed annually)'}
                    </span>
                  </div>
                  <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    {plan.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button
                      asChild
                      size="lg"
                      variant={plan.highlight ? 'default' : 'outline'}
                      className={plan.highlight ? 'w-full shadow-md dark:bg-white dark:text-slate-900' : 'w-full border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}
                    >
                      <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="security" className="bg-slate-50/80 transition-colors dark:bg-slate-900/60">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 transition dark:text-white sm:text-3xl">
                Enterprise-grade security
              </h2>
              <p className="mt-3 text-base text-slate-600 transition dark:text-slate-300">
                TrackMail respects user privacy with transparent security practices.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {securityFeatures.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/5 dark:bg-slate-700/20">
                    <Icon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="bg-slate-900">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-20 text-center text-white sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to track your applications automatically?
            </h2>
            <p className="text-base text-slate-200 sm:text-lg">
              Join thousands of job seekers who never miss an opportunity.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="min-w-[180px] bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-[180px] border-white text-white hover:bg-white/10">
                <Link href="mailto:hello@trackmail.app">Schedule Demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 transition-colors dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 text-sm text-slate-600 transition dark:text-slate-300 sm:grid-cols-2 md:grid-cols-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <Link href="/" className="text-lg font-semibold text-slate-900 sm:text-xl">
              TrackMail
            </Link>
            <p className="text-sm text-slate-600">
              Automatically track your job applications from Gmail with intelligent parsing and analytics.
            </p>
            <div className="flex gap-4 text-slate-500">
              <Link href="https://twitter.com" aria-label="TrackMail on Twitter">
                X
              </Link>
              <Link href="https://github.com" aria-label="TrackMail on GitHub">
                GitHub
              </Link>
            </div>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-1 md:gap-12 lg:col-span-3 lg:grid-cols-3">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section} className="space-y-4 text-sm">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </h4>
                <ul className="space-y-2 text-slate-600">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="transition hover:text-slate-900">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-200/70 bg-white/60 py-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} TrackMail. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#privacy" className="transition hover:text-slate-700">
                Privacy
              </Link>
              <Link href="#terms" className="transition hover:text-slate-700">
                Terms
              </Link>
              <Link href="mailto:hello@trackmail.app" className="transition hover:text-slate-700">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}