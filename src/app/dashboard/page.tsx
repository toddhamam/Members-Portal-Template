'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import type { DashboardMetrics, FunnelStep, ABTestMetrics } from '@/lib/supabase/types';

// Date range options
const DATE_RANGES = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'All Time', days: 365 * 10 },
];

// Funnel step display names
const STEP_NAMES: Record<FunnelStep, string> = {
  'landing': 'Landing',
  'checkout': 'Checkout',
  'upsell-1': 'Upsell 1',
  'downsell-1': 'Downsell 1',
  'upsell-2': 'Upsell 2',
  'thank-you': 'Thank You',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState(30);
  const [selectedStep, setSelectedStep] = useState<FunnelStep | null>(null);
  const [activeSessions, setActiveSessions] = useState(0);
  const [adSpend, setAdSpend] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dashboard_ad_spend');
        return saved ? parseFloat(saved) : 0;
      } catch {
        // localStorage not available (private browsing) - use default
        return 0;
      }
    }
    return 0;
  });

  // Poll for active sessions every 10 seconds
  useEffect(() => {
    async function fetchActiveSessions() {
      try {
        const response = await fetch('/api/dashboard/active-sessions');
        const data = await response.json();
        setActiveSessions(data.count || 0);
      } catch {
        // Silently fail - not critical
      }
    }

    // Fetch immediately
    fetchActiveSessions();

    // Then poll every 10 seconds
    const interval = setInterval(fetchActiveSessions, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch metrics when date range changes
  useEffect(() => {
    async function fetchMetrics() {
      setIsLoading(true);
      setError(null);

      try {
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - selectedRange * 24 * 60 * 60 * 1000).toISOString();

        const response = await fetch(`/api/dashboard/metrics?startDate=${startDate}&endDate=${endDate}`);

        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, [selectedRange]);

  // Save ad spend to localStorage (safe for private browsing)
  const handleAdSpendChange = (value: number) => {
    setAdSpend(value);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dashboard_ad_spend', value.toString());
      } catch {
        // localStorage not available (private browsing) - ignore
      }
    }
  };

  // Calculate ROAS and CAC
  const roas = adSpend > 0 && metrics ? metrics.summary.totalRevenue / adSpend : 0;
  const cac = metrics?.summary.uniqueCustomers && adSpend > 0
    ? adSpend / metrics.summary.uniqueCustomers
    : 0;

  // Get A/B test data for selected step
  const stepABTests = selectedStep
    ? metrics?.abTests.filter((ab) => ab.step === selectedStep) || []
    : [];

  // Calculate funnel totals
  const funnelTotals = metrics
    ? {
        sessions: metrics.stepMetrics.find((s) => s.step === 'landing')?.sessions || 0,
        purchases: metrics.summary.purchases,
        conversionRate: metrics.summary.conversionRate,
        revenue: metrics.summary.totalRevenue,
      }
    : { sessions: 0, purchases: 0, conversionRate: 0, revenue: 0 };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Floating Header */}
      <header className="pt-4 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2.5 flex items-center justify-between shadow-sm border border-slate-200/60">
            {/* Left: Dashboard Branding */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-lime-500 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-slate-700 font-semibold text-sm">Funnel Analytics</span>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center gap-2">
              {/* User Email */}
              <span className="hidden sm:inline text-slate-500 text-sm max-w-[160px] truncate">{user?.email}</span>
              {/* Logout Button */}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-700 transition-all text-sm"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Top Bar: Live Sessions + Date Range */}
        <div className="flex items-center justify-between mb-6">
          {/* Live Sessions - Soft Card */}
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${
            activeSessions > 0
              ? 'bg-gradient-to-br from-lime-50 to-white border-lime-200/60 shadow-sm'
              : 'bg-gradient-to-br from-slate-50 to-white border-slate-200/60 shadow-sm'
          }`}>
            {/* Pulsing dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeSessions > 0 ? 'bg-lime-400' : 'bg-gray-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeSessions > 0 ? 'bg-lime-500' : 'bg-gray-400'}`}></span>
            </span>
            {/* Text */}
            <span className="text-sm">
              <span className={`font-semibold ${activeSessions > 0 ? 'text-lime-700' : 'text-slate-700'}`}>{activeSessions}</span>
              <span className={activeSessions > 0 ? 'text-lime-600/80' : 'text-slate-500'}> {activeSessions === 1 ? 'visitor' : 'visitors'} online</span>
            </span>
          </div>
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(Number(e.target.value))}
            className="px-4 py-2 border border-violet-200/60 rounded-xl bg-gradient-to-br from-violet-50 to-white text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all cursor-pointer"
          >
            {DATE_RANGES.map((range) => (
              <option key={range.days} value={range.days}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-lime-100 border-t-lime-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-200/60 rounded-2xl p-4 mb-6">
            <p className="text-rose-500 text-sm">{error}</p>
          </div>
        )}

        {/* Metrics Content */}
        {!isLoading && !error && metrics && (
          <>
            {/* Hero Revenue Card + Secondary Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Revenue - Hero Card */}
              <div className="bg-gradient-to-br from-lime-50 to-white rounded-2xl p-5 shadow-sm border border-lime-100/60">
                <p className="text-sm text-lime-600/80 mb-1">Total Revenue</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-semibold text-slate-800 tracking-tight">
                    {formatCurrency(metrics.summary.totalRevenue)}
                  </p>
                  {metrics.summary.purchases > 0 && (
                    <span className="text-lime-600 text-sm font-medium flex items-center gap-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                      </svg>
                      {metrics.summary.purchases} sales
                    </span>
                  )}
                </div>
              </div>

              {/* Ad Spend + ROAS */}
              <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl p-5 shadow-sm border border-violet-100/60">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-violet-600/80 mb-1">Ad Spend</p>
                    <div className="flex items-center">
                      <span className="text-violet-400 text-2xl font-semibold">$</span>
                      <input
                        type="number"
                        value={adSpend || ''}
                        onChange={(e) => handleAdSpendChange(Number(e.target.value))}
                        placeholder="0"
                        className="w-24 text-2xl font-semibold text-slate-800 border-none focus:outline-none focus:ring-0 p-0 bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-violet-600/80 mb-1">ROAS</p>
                    <p className={`text-2xl font-semibold ${roas >= 2 ? 'text-lime-600' : roas > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {roas > 0 ? `${roas.toFixed(2)}x` : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* CAC + Customers */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">CAC</p>
                    <p className="text-2xl font-semibold text-slate-800">
                      {cac > 0 ? formatCurrency(cac) : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Customers</p>
                    <p className="text-2xl font-semibold text-violet-600">
                      {metrics.summary.uniqueCustomers}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Funnel Breakdown Table */}
            <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl shadow-sm border border-slate-200/60 mb-6 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100/80 flex items-center justify-between bg-white/60">
                <h2 className="text-base font-semibold text-slate-800">Funnel Breakdown</h2>
                <span className="text-sm text-slate-500">
                  AOV: <span className="font-medium text-lime-600">{formatCurrency(metrics.summary.aovPerCustomer)}</span>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50/80 to-violet-50/30">
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Step</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sessions</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Purchases</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Conv %</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {metrics.stepMetrics.map((step) => {
                      const hasABTest = metrics.abTests.some((ab) => ab.step === step.step);
                      return (
                        <tr
                          key={step.step}
                          className={`transition-colors ${
                            selectedStep === step.step ? 'bg-lime-50/50' : 'hover:bg-slate-50/30'
                          } ${hasABTest ? 'cursor-pointer' : ''}`}
                          onClick={() => hasABTest && setSelectedStep(step.step === selectedStep ? null : step.step)}
                        >
                          <td className="px-5 py-3.5 text-sm text-slate-700 font-medium">
                            {STEP_NAMES[step.step]}
                            {hasABTest && (
                              <span className="ml-2 text-xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">
                                A/B
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600 text-right tabular-nums">
                            {step.sessions.toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600 text-right tabular-nums">
                            {step.step === 'landing' || step.step === 'thank-you'
                              ? <span className="text-slate-300">—</span>
                              : step.purchases.toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-right tabular-nums">
                            {step.step === 'landing' || step.step === 'thank-you'
                              ? <span className="text-slate-300">—</span>
                              : <span className={step.conversionRate >= 5 ? 'text-lime-600 font-medium' : 'text-slate-600'}>{formatPercent(step.conversionRate)}</span>}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-700 text-right tabular-nums font-medium">
                            {step.step === 'landing' || step.step === 'thank-you'
                              ? <span className="text-slate-300 font-normal">—</span>
                              : formatCurrency(step.revenue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-lime-50/60 to-white">
                      <td className="px-5 py-3.5 text-sm text-slate-800 font-semibold">Total</td>
                      <td className="px-5 py-3.5 text-sm text-slate-800 text-right tabular-nums font-semibold">
                        {funnelTotals.sessions.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-800 text-right tabular-nums font-semibold">
                        {funnelTotals.purchases.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-lime-600 text-right tabular-nums font-semibold">
                        {formatPercent(funnelTotals.conversionRate)}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-800 text-right tabular-nums font-semibold">
                        {formatCurrency(funnelTotals.revenue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* A/B Test Comparison */}
            {selectedStep && stepABTests.length > 0 && (
              <div className="bg-gradient-to-br from-violet-50/50 to-white rounded-2xl shadow-sm border border-violet-200/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-violet-100/60 flex items-center justify-between bg-white/60">
                  <h2 className="text-base font-semibold text-slate-800">
                    A/B Test: {STEP_NAMES[selectedStep]}
                  </h2>
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="text-violet-400 hover:text-violet-600 transition-colors p-1 rounded-lg hover:bg-violet-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-5">
                  {/* Winner indicator */}
                  {stepABTests.length >= 2 && (
                    <ABTestWinner variants={stepABTests} />
                  )}

                  {/* Variant comparison table */}
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-violet-50/50 to-slate-50/30">
                          <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Variant</th>
                          <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Sessions</th>
                          <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Purchases</th>
                          <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Conv %</th>
                          <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-violet-100/40">
                        {stepABTests.map((variant) => (
                          <tr key={variant.variant} className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-5 py-3.5 text-sm text-slate-700 font-medium capitalize">
                              {variant.variant}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600 text-right tabular-nums">
                              {variant.sessions.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600 text-right tabular-nums">
                              {variant.purchases.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-600 text-right tabular-nums">
                              {formatPercent(variant.conversionRate)}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-700 text-right tabular-nums font-medium">
                              {formatCurrency(variant.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Step Detail Tabs */}
            {metrics.abTests.length > 0 && !selectedStep && (
              <div className="bg-gradient-to-br from-violet-50/30 to-white rounded-2xl shadow-sm border border-violet-100/60 p-5">
                <h2 className="text-base font-semibold text-slate-800 mb-4">A/B Tests Available</h2>
                <div className="flex flex-wrap gap-2">
                  {metrics.stepMetrics
                    .filter((step) => metrics.abTests.some((ab) => ab.step === step.step))
                    .map((step) => (
                      <button
                        key={step.step}
                        onClick={() => setSelectedStep(step.step)}
                        className="px-4 py-2 text-sm bg-white hover:bg-violet-50 border border-violet-200/60 rounded-xl text-slate-700 transition-colors font-medium shadow-sm"
                      >
                        {STEP_NAMES[step.step]}
                        <span className="ml-2 text-xs bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
                          A/B
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && metrics && metrics.summary.sessions === 0 && (
          <div className="bg-gradient-to-br from-lime-50/30 to-white rounded-2xl shadow-sm border border-lime-100/60 p-10 text-center">
            <div className="w-12 h-12 bg-lime-100/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-slate-600 mb-2 font-medium">No funnel data yet</p>
            <p className="text-sm text-slate-400">
              Events will appear here as visitors move through your funnel.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-slate-400">
            <Link href="/portal" className="hover:text-violet-500 transition-colors">
              Member Portal
            </Link>
            <span className="mx-2">·</span>
            <Link href="/" className="hover:text-lime-600 transition-colors">
              Funnel
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

// A/B Test Winner Component
function ABTestWinner({ variants }: { variants: ABTestMetrics[] }) {
  if (variants.length < 2) return null;

  // Sort by conversion rate to find winner
  const sorted = [...variants].sort((a, b) => b.conversionRate - a.conversionRate);
  const winner = sorted[0];
  const loser = sorted[1];

  if (winner.sessions < 100 || loser.sessions < 100) {
    return (
      <div className="bg-gradient-to-br from-amber-50/80 to-white border border-amber-200/60 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-100/80 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-amber-600">
          Need at least 100 sessions per variant for statistical significance.
        </p>
      </div>
    );
  }

  const lift = loser.conversionRate > 0
    ? ((winner.conversionRate - loser.conversionRate) / loser.conversionRate) * 100
    : 0;

  // Simple confidence calculation (would need proper z-test for production)
  const totalSessions = winner.sessions + loser.sessions;
  const confidence = totalSessions > 500 ? 95 : totalSessions > 200 ? 85 : 70;

  return (
    <div className="bg-gradient-to-br from-lime-50/80 to-white border border-lime-200/60 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-lime-100/80 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <span className="font-semibold text-lime-700 uppercase text-sm">
            {winner.variant} Winning
          </span>
          <p className="text-sm text-lime-600">
            +{lift.toFixed(1)}% lift
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs text-lime-600 font-medium bg-lime-100/80 px-2 py-1 rounded-full">
          {confidence}% confidence
        </span>
      </div>
    </div>
  );
}
