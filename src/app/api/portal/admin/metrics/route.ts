import { NextRequest, NextResponse } from 'next/server';
import { createAdminClientInstance } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/server';
import type { AdminMetricsResponse } from '@/lib/admin/types';

/**
 * GET /api/portal/admin/metrics
 *
 * Returns admin portal metrics for the dashboard.
 * Requires admin authentication.
 *
 * Query params:
 * - startDate: ISO date string (defaults to 30 days ago)
 * - endDate: ISO date string (defaults to now)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client for all queries
    const supabase = createAdminClientInstance();

    // Verify admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse date range
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startDate = searchParams.get('startDate') || thirtyDaysAgo.toISOString();
    const endDate = searchParams.get('endDate') || now.toISOString();

    // Fetch all data in parallel for performance
    const [
      profilesResult,
      newProfilesResult,
      purchasesResult,
      portalPurchasesResult,
      productsResult,
      progressResult,
      postsResult,
      commentsResult,
      reactionsResult,
      postsInPeriodResult,
      commentsInPeriodResult,
    ] = await Promise.all([
      // Total members
      supabase.from('profiles').select('id', { count: 'exact', head: true }),

      // New members in period
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate),

      // All purchases with product prices
      supabase
        .from('user_purchases')
        .select(`
          id,
          user_id,
          product_id,
          purchase_source,
          products (
            id,
            name,
            slug,
            price_cents,
            portal_price_cents
          )
        `)
        .eq('status', 'active'),

      // Portal purchases count
      supabase
        .from('user_purchases')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .eq('purchase_source', 'portal'),

      // All products for popularity ranking
      supabase.from('products').select('id, name, slug').eq('is_active', true),

      // All lesson progress for completion calculation
      supabase
        .from('lesson_progress')
        .select('user_id, lesson_id, progress_percent'),

      // Total posts
      supabase
        .from('discussion_posts')
        .select('id', { count: 'exact', head: true }),

      // Total comments
      supabase
        .from('discussion_comments')
        .select('id', { count: 'exact', head: true }),

      // Total reactions
      supabase
        .from('discussion_reactions')
        .select('id', { count: 'exact', head: true }),

      // Posts in period
      supabase
        .from('discussion_posts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate),

      // Comments in period
      supabase
        .from('discussion_comments')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate),
    ]);

    // Calculate metrics
    const totalMembers = profilesResult.count || 0;
    const newMembers = newProfilesResult.count || 0;
    const purchases = purchasesResult.data || [];
    const portalPurchaseCount = portalPurchasesResult.count || 0;
    const products = productsResult.data || [];
    const progress = progressResult.data || [];

    // Calculate revenue
    let totalRevenue = 0;
    let portalRevenue = 0;
    let funnelRevenue = 0;
    const uniqueCustomers = new Set<string>();
    const portalCustomers = new Set<string>();
    const purchaseCountByProduct = new Map<string, number>();

    for (const purchase of purchases) {
      uniqueCustomers.add(purchase.user_id);

      // Get price (use portal price for portal purchases if available)
      const product = purchase.products as { price_cents: number; portal_price_cents: number | null } | null;
      const isPortal = purchase.purchase_source === 'portal';
      const priceCents = isPortal && product?.portal_price_cents
        ? product.portal_price_cents
        : (product?.price_cents || 0);

      totalRevenue += priceCents;

      if (isPortal) {
        portalRevenue += priceCents;
        portalCustomers.add(purchase.user_id);
      } else {
        funnelRevenue += priceCents;
      }

      // Count purchases per product
      const currentCount = purchaseCountByProduct.get(purchase.product_id) || 0;
      purchaseCountByProduct.set(purchase.product_id, currentCount + 1);
    }

    // Convert cents to dollars
    totalRevenue = totalRevenue / 100;
    portalRevenue = portalRevenue / 100;
    funnelRevenue = funnelRevenue / 100;

    // Calculate average LTV (total revenue / unique customers who purchased)
    const averageLTV = uniqueCustomers.size > 0
      ? totalRevenue / uniqueCustomers.size
      : 0;

    // Portal conversion rate (% of members who made at least one portal purchase)
    const portalConversionRate = totalMembers > 0
      ? (portalCustomers.size / totalMembers) * 100
      : 0;

    // Average products per member (only counting members who have purchases)
    const averageProductsPerMember = uniqueCustomers.size > 0
      ? purchases.length / uniqueCustomers.size
      : 0;

    // Most popular products (top 5)
    const productPopularity = products
      .map((p: { id: string; name: string; slug: string }) => ({
        productId: p.id,
        productName: p.name,
        productSlug: p.slug,
        purchaseCount: purchaseCountByProduct.get(p.id) || 0,
      }))
      .sort((a: { purchaseCount: number }, b: { purchaseCount: number }) => b.purchaseCount - a.purchaseCount)
      .slice(0, 5);

    // Calculate average course completion
    // Group progress by user and calculate average completion per user, then overall average
    const userProgressMap = new Map<string, number[]>();
    for (const p of progress) {
      const existing = userProgressMap.get(p.user_id) || [];
      existing.push(p.progress_percent);
      userProgressMap.set(p.user_id, existing);
    }

    let totalCompletionSum = 0;
    let userCount = 0;
    for (const progressArr of userProgressMap.values()) {
      const userAvg = progressArr.reduce((sum, p) => sum + p, 0) / progressArr.length;
      totalCompletionSum += userAvg;
      userCount++;
    }
    const averageCompletionRate = userCount > 0 ? totalCompletionSum / userCount : 0;

    // Build response
    const metrics: AdminMetricsResponse = {
      members: {
        total: totalMembers,
        newInPeriod: newMembers,
      },
      revenue: {
        totalLifetime: totalRevenue,
        portalRevenue,
        funnelRevenue,
        averageLTV,
      },
      purchases: {
        totalCount: purchases.length,
        portalCount: portalPurchaseCount,
        portalConversionRate,
        averageProductsPerMember,
      },
      products: {
        mostPopular: productPopularity,
      },
      courseProgress: {
        averageCompletionRate,
      },
      community: {
        totalPosts: postsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalReactions: reactionsResult.count || 0,
        postsInPeriod: postsInPeriodResult.count || 0,
        commentsInPeriod: commentsInPeriodResult.count || 0,
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('[Admin Metrics API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
