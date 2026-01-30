// Admin Portal Analytics Types

export type PurchaseSource = 'funnel' | 'portal' | 'migration';

// Activity status based on last_active_at
// Active: within 30 days, At Risk: 30-60 days, Dormant: 60+ days, Never: null
export type ActivityStatus = 'active' | 'at_risk' | 'dormant' | 'never';

// ============================================
// ADMIN METRICS API RESPONSE
// GET /api/portal/admin/metrics
// ============================================

export interface AdminMetricsResponse {
  members: {
    total: number;
    freeMembers: number;        // Members with no paid purchases
    paidMembers: number;        // Members with at least one paid purchase
    conversionRate: number;     // (paidMembers / total) * 100
    newInPeriod: number;
  };
  revenue: {
    totalLifetime: number;      // All purchases (dollars)
    portalRevenue: number;      // Portal-only purchases (dollars)
    funnelRevenue: number;      // Funnel-only purchases (dollars)
    averageLTV: number;         // Total revenue / unique customers with purchases
  };
  purchases: {
    totalCount: number;         // All purchases ever
    portalCount: number;        // Portal purchases ever
    portalConversionRate: number; // % of members who made at least one portal purchase
    averageProductsPerMember: number;
  };
  products: {
    mostPopular: Array<{
      productId: string;
      productName: string;
      productSlug: string;
      purchaseCount: number;
    }>;
  };
  courseProgress: {
    averageCompletionRate: number; // Average across all users and products
  };
  community: {
    totalPosts: number;
    totalComments: number;
    totalReactions: number;
    postsInPeriod: number;
    commentsInPeriod: number;
  };
  activity: {
    activeIn7Days: number;        // Members active in last 7 days
    activeIn30Days: number;       // Members active in last 30 days
    atRiskCount: number;          // 30-60 days inactive
    dormantCount: number;         // 60+ days inactive
    freeDormantCount: number;     // Free members 60+ days inactive
    paidDormantCount: number;     // Paid members 60+ days inactive
  };
}

// ============================================
// MEMBERS LIST API RESPONSE
// GET /api/portal/admin/members
// ============================================

export type MembershipTier = 'free' | 'paid';

export interface MemberSummary {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  productsOwned: number;
  overallProgress: number;      // Average progress across owned products (0-100)
  ltv: number;                  // Total spent in dollars
  joinedAt: string;             // ISO date string
  membershipTier: MembershipTier;
  lastActiveAt: string | null;  // ISO date string, null if never active
  activityStatus: ActivityStatus;
}

export interface MembersListResponse {
  members: MemberSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export type MemberSortField =
  | 'name'
  | 'email'
  | 'products_count'
  | 'ltv'
  | 'created_at'
  | 'progress'
  | 'tier'
  | 'last_active_at'
  | 'activity_status';

export type SortOrder = 'asc' | 'desc';

// ============================================
// MEMBER DETAIL API RESPONSE
// GET /api/portal/admin/members/[id]
// ============================================

export interface MemberProductProgress {
  productId: string;
  productName: string;
  productSlug: string;
  thumbnailUrl: string | null;
  purchasedAt: string;
  purchaseSource: PurchaseSource;
  progressPercent: number;      // Overall product progress (0-100)
  lessonsCompleted: number;
  totalLessons: number;
  modules: Array<{
    moduleId: string;
    moduleTitle: string;
    lessons: Array<{
      lessonId: string;
      lessonTitle: string;
      progressPercent: number;
      completedAt: string | null;
    }>;
  }>;
}

export interface MemberPurchaseHistory {
  productName: string;
  productSlug: string;
  amount: number;               // In dollars
  purchasedAt: string;
  source: PurchaseSource;
}

export interface MemberCommunityStats {
  postsCount: number;
  commentsCount: number;
  reactionsGiven: number;
}

export interface MemberDetailResponse {
  profile: {
    id: string;
    email: string;
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    stripeCustomerId: string | null;
    joinedAt: string;
    membershipTier: MembershipTier;
    lastActiveAt: string | null;
    activityStatus: ActivityStatus;
    daysSinceActive: number | null;
  };
  financials: {
    lifetimeValue: number;      // Total spent in dollars
    funnelSpend: number;        // From funnel purchases in dollars
    portalSpend: number;        // From portal purchases in dollars
  };
  products: MemberProductProgress[];
  purchaseHistory: MemberPurchaseHistory[];
  communityStats: MemberCommunityStats;
}
