'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
      const saved = localStorage.getItem('dashboard_ad_spend');
      return saved ? parseFloat(saved) : 0;
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

  // Save ad spend to localStorage
  const handleAdSpendChange = (value: number) => {
    setAdSpend(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_ad_spend', value.toString());
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-black py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="Inner Wealth Initiate"
            width={150}
            height={38}
          />
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:inline">{user?.email}</span>
            <button
              onClick={() => signOut()}
              className="text-gray-400 hover:text-white text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Live Sessions Counter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeSessions > 0 ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${activeSessions > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          </span>
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{activeSessions}</span>
            {' '}{activeSessions === 1 ? 'visitor' : 'visitors'} online now
          </span>
        </div>

        {/* Title and Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Funnel Dashboard</h1>
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Metrics Content */}
        {!isLoading && !error && metrics && (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Revenue */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(metrics.summary.totalRevenue)}
                </p>
              </div>

              {/* Ad Spend */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Ad Spend</p>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">$</span>
                  <input
                    type="number"
                    value={adSpend || ''}
                    onChange={(e) => handleAdSpendChange(Number(e.target.value))}
                    placeholder="0"
                    className="w-full text-2xl font-semibold text-gray-900 border-none focus:outline-none focus:ring-0 p-0 bg-transparent"
                  />
                </div>
              </div>

              {/* ROAS */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">ROAS</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {roas > 0 ? `${roas.toFixed(2)}x` : '—'}
                </p>
              </div>

              {/* CAC */}
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">CAC</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {cac > 0 ? formatCurrency(cac) : '—'}
                </p>
              </div>
            </div>

            {/* Funnel Breakdown Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Funnel Breakdown</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Page</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Sessions</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Purchases</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Conv %</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.stepMetrics.map((step) => {
                      const hasABTest = metrics.abTests.some((ab) => ab.step === step.step);
                      return (
                        <tr
                          key={step.step}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            selectedStep === step.step ? 'bg-blue-50' : ''
                          } ${hasABTest ? 'cursor-pointer' : ''}`}
                          onClick={() => hasABTest && setSelectedStep(step.step === selectedStep ? null : step.step)}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {STEP_NAMES[step.step]}
                            {hasABTest && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                A/B
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {step.sessions.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {step.step === 'landing' || step.step === 'thank-you'
                              ? '—'
                              : step.purchases.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {step.step === 'landing' || step.step === 'thank-you'
                              ? '—'
                              : formatPercent(step.conversionRate)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {step.step === 'landing' || step.step === 'thank-you'
                              ? '—'
                              : formatCurrency(step.revenue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-3 text-sm text-gray-900">Funnel Total</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {funnelTotals.sessions.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {funnelTotals.purchases.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {formatPercent(funnelTotals.conversionRate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {formatCurrency(funnelTotals.revenue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Summary row below table */}
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-4 text-sm">
                <span className="text-gray-600">
                  Unique Customers: <span className="font-medium text-gray-900">{metrics.summary.uniqueCustomers}</span>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">
                  AOV per Customer: <span className="font-medium text-gray-900">{formatCurrency(metrics.summary.aovPerCustomer)}</span>
                </span>
              </div>
            </div>

            {/* A/B Test Comparison */}
            {selectedStep && stepABTests.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    A/B Test: {STEP_NAMES[selectedStep]}
                  </h2>
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-4">
                  {/* Winner indicator */}
                  {stepABTests.length >= 2 && (
                    <ABTestWinner variants={stepABTests} />
                  )}

                  {/* Variant comparison table */}
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Variant</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Sessions</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Purchases</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Conv %</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stepABTests.map((variant) => (
                          <tr key={variant.variant} className="border-b border-gray-100">
                            <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                              {variant.variant}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {variant.sessions.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {variant.purchases.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {formatPercent(variant.conversionRate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Step Details</h2>
                <div className="flex flex-wrap gap-2">
                  {metrics.stepMetrics
                    .filter((step) => metrics.abTests.some((ab) => ab.step === step.step))
                    .map((step) => (
                      <button
                        key={step.step}
                        onClick={() => setSelectedStep(step.step)}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
                      >
                        {STEP_NAMES[step.step]}
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 mb-4">No funnel data yet.</p>
            <p className="text-sm text-gray-400">
              Events will appear here as visitors move through your funnel.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            <Link href="/portal" className="hover:text-gray-700">
              Member Portal
            </Link>
            {' · '}
            <Link href="/" className="hover:text-gray-700">
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-700">
          Not enough data yet. Need at least 100 sessions per variant for statistical significance.
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
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🏆</span>
        <span className="font-semibold text-green-800 uppercase">
          {winner.variant} Winning
        </span>
      </div>
      <p className="text-sm text-green-700">
        +{lift.toFixed(1)}% lift · {confidence}% confidence
      </p>
    </div>
  );
}
