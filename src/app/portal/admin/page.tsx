"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MetricCard, SmallMetric } from "@/components/portal/admin/MetricCard";
import { MembersTable } from "@/components/portal/admin/MembersTable";
import { MemberSlideOver } from "@/components/portal/admin/MemberSlideOver";
import type { AdminMetricsResponse, MemberSummary, MembershipTier } from "@/lib/admin/types";

// Date range options
const DATE_RANGES = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "All Time", days: 365 * 10 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetricsResponse | null>(null);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState(30);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Members list state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [tierFilter, setTierFilter] = useState<MembershipTier | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Fetch metrics when date range changes
  useEffect(() => {
    async function fetchMetrics() {
      setIsLoadingMetrics(true);
      setError(null);

      try {
        const endDate = new Date().toISOString();
        const startDate = new Date(
          Date.now() - selectedRange * 24 * 60 * 60 * 1000
        ).toISOString();

        const response = await fetch(
          `/api/portal/admin/metrics?startDate=${startDate}&endDate=${endDate}`
        );

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Access denied. Admin privileges required.");
          }
          throw new Error("Failed to fetch metrics");
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoadingMetrics(false);
      }
    }

    fetchMetrics();
  }, [selectedRange]);

  // Fetch members list
  const fetchMembers = useCallback(async () => {
    setIsLoadingMembers(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        sortBy,
        sortOrder,
      });

      if (searchQuery) {
        params.set("search", searchQuery);
      }

      if (tierFilter !== "all") {
        params.set("tier", tierFilter);
      }

      const response = await fetch(`/api/portal/admin/members?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const data = await response.json();
      setMembers(data.members);
      setTotalMembers(data.pagination.total);
      setHasMore(data.pagination.hasMore);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [currentPage, sortBy, sortOrder, searchQuery, tierFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchMembers();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleMemberClick = (memberId: string) => {
    setSelectedMemberId(memberId);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Portal Analytics
                </h1>
                <p className="text-sm text-slate-500">Member metrics & insights</p>
              </div>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-200/60 rounded-2xl p-4 mb-6">
            <p className="text-rose-500 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State for Metrics */}
        {isLoadingMetrics && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-100 border-t-violet-500" />
          </div>
        )}

        {/* Metrics Content */}
        {!isLoadingMetrics && !error && metrics && (
          <>
            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Total Members"
                value={metrics.members.total.toLocaleString()}
                subtitle={`${metrics.members.freeMembers} free · ${metrics.members.paidMembers} paid`}
                gradient="violet"
                icon={
                  <div className="w-10 h-10 rounded-full bg-violet-100/80 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-violet-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                }
              />

              <MetricCard
                title="Total Revenue"
                value={formatCurrency(metrics.revenue.totalLifetime)}
                subtitle={`Avg LTV: ${formatCurrency(metrics.revenue.averageLTV)}`}
                gradient="lime"
                icon={
                  <div className="w-10 h-10 rounded-full bg-lime-100/80 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-lime-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                }
              />

              <MetricCard
                title="Portal Revenue"
                value={formatCurrency(metrics.revenue.portalRevenue)}
                subtitle={`${metrics.purchases.portalCount} portal purchases`}
                gradient="amber"
                icon={
                  <div className="w-10 h-10 rounded-full bg-amber-100/80 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                }
              />

              <MetricCard
                title="Free → Paid"
                value={formatPercent(metrics.members.conversionRate)}
                subtitle={`${metrics.purchases.averageProductsPerMember.toFixed(1)} products/member`}
                gradient="slate"
                icon={
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                }
              />
            </div>

            {/* Secondary Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Most Popular Products */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-4">
                  Most Popular Products
                </h3>
                {metrics.products.mostPopular.length === 0 ? (
                  <p className="text-sm text-slate-400">No purchases yet</p>
                ) : (
                  <div className="space-y-3">
                    {metrics.products.mostPopular.map((product, index) => (
                      <div
                        key={product.productId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              index === 0
                                ? "bg-lime-100 text-lime-700"
                                : index === 1
                                ? "bg-violet-100 text-violet-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="text-sm text-slate-700">
                            {product.productName}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {product.purchaseCount} sales
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Course Progress & Community */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
                <h3 className="text-base font-semibold text-slate-800 mb-4">
                  Engagement Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <SmallMetric
                    title="Avg Course Completion"
                    value={formatPercent(metrics.courseProgress.averageCompletionRate)}
                    color="violet"
                  />
                  <SmallMetric
                    title="Total Purchases"
                    value={metrics.purchases.totalCount.toLocaleString()}
                    color="lime"
                  />
                  <SmallMetric
                    title="Community Posts"
                    value={`${metrics.community.totalPosts} (${metrics.community.postsInPeriod} new)`}
                  />
                  <SmallMetric
                    title="Comments & Reactions"
                    value={`${metrics.community.totalComments} / ${metrics.community.totalReactions}`}
                  />
                </div>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 mb-6">
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                Revenue Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-lime-50 to-white rounded-xl border border-lime-100/60">
                  <p className="text-sm text-lime-600/80 mb-1">Total Revenue</p>
                  <p className="text-2xl font-semibold text-slate-800">
                    {formatCurrency(metrics.revenue.totalLifetime)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-white rounded-xl border border-violet-100/60">
                  <p className="text-sm text-violet-600/80 mb-1">
                    Funnel Revenue
                  </p>
                  <p className="text-2xl font-semibold text-slate-800">
                    {formatCurrency(metrics.revenue.funnelRevenue)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100/60">
                  <p className="text-sm text-amber-600/80 mb-1">
                    Portal Revenue
                  </p>
                  <p className="text-2xl font-semibold text-slate-800">
                    {formatCurrency(metrics.revenue.portalRevenue)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Members Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Members
              </h2>
              <p className="text-sm text-slate-500">
                {totalMembers.toLocaleString()} total members
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => {
                  setTierFilter(e.target.value as MembershipTier | "all");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <MembersTable
            members={members}
            isLoading={isLoadingMembers}
            onMemberClick={handleMemberClick}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {/* Pagination */}
          {totalMembers > 20 && (
            <div className="px-5 py-4 border-t border-slate-100/80 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page {currentPage} of {Math.ceil(totalMembers / 20)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Member Detail Slide-Over */}
      <MemberSlideOver
        memberId={selectedMemberId}
        isOpen={selectedMemberId !== null}
        onClose={() => setSelectedMemberId(null)}
      />
    </>
  );
}
