import { NextRequest, NextResponse } from 'next/server';
import { createAdminClientInstance, getUser } from '@/lib/supabase/server';
import type { MembersListResponse, MemberSummary, MemberSortField, SortOrder } from '@/lib/admin/types';

/**
 * GET /api/portal/admin/members
 *
 * Returns paginated, searchable, sortable list of members.
 * Requires admin authentication.
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 50)
 * - search: Search by name or email
 * - sortBy: Sort field (default: 'created_at')
 * - sortOrder: 'asc' or 'desc' (default: 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search') || '';
    const sortBy = (searchParams.get('sortBy') || 'created_at') as MemberSortField;
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as SortOrder;

    const offset = (page - 1) * limit;

    // Build base query for profiles
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, created_at', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Apply sorting for basic fields
    if (sortBy === 'name') {
      query = query.order('full_name', { ascending: sortOrder === 'asc', nullsFirst: false });
    } else if (sortBy === 'email') {
      query = query.order('email', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    } else {
      // For computed fields (ltv, products_count, progress), we'll sort client-side after enriching
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: profiles, error: profilesError, count } = await query;

    if (profilesError) {
      console.error('[Members API] Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        members: [],
        pagination: { page, limit, total: 0, hasMore: false },
      } as MembersListResponse);
    }

    // Get user IDs for batch queries
    const userIds = profiles.map((p: { id: string }) => p.id);

    // Fetch purchases and progress in parallel
    const [purchasesResult, progressResult] = await Promise.all([
      supabase
        .from('user_purchases')
        .select(`
          user_id,
          product_id,
          products (price_cents, portal_price_cents),
          purchase_source
        `)
        .in('user_id', userIds)
        .eq('status', 'active'),

      supabase
        .from('lesson_progress')
        .select('user_id, progress_percent')
        .in('user_id', userIds),
    ]);

    // Build member purchase stats
    const memberStats = new Map<string, { productsOwned: number; ltv: number; progressSum: number; progressCount: number }>();

    for (const userId of userIds) {
      memberStats.set(userId, { productsOwned: 0, ltv: 0, progressSum: 0, progressCount: 0 });
    }

    // Process purchases
    for (const purchase of purchasesResult.data || []) {
      const stats = memberStats.get(purchase.user_id);
      if (stats) {
        stats.productsOwned++;
        const product = purchase.products as { price_cents: number; portal_price_cents: number | null } | null;
        const isPortal = purchase.purchase_source === 'portal';
        const priceCents = isPortal && product?.portal_price_cents
          ? product.portal_price_cents
          : (product?.price_cents || 0);
        stats.ltv += priceCents / 100; // Convert to dollars
      }
    }

    // Process progress
    for (const progress of progressResult.data || []) {
      const stats = memberStats.get(progress.user_id);
      if (stats) {
        stats.progressSum += progress.progress_percent;
        stats.progressCount++;
      }
    }

    // Build response
    const members: MemberSummary[] = profiles.map((p: { id: string; email: string; full_name: string | null; avatar_url: string | null; created_at: string }) => {
      const stats = memberStats.get(p.id)!;
      return {
        id: p.id,
        email: p.email,
        fullName: p.full_name,
        avatarUrl: p.avatar_url,
        productsOwned: stats.productsOwned,
        overallProgress: stats.progressCount > 0 ? stats.progressSum / stats.progressCount : 0,
        ltv: stats.ltv,
        joinedAt: p.created_at,
      };
    });

    // Sort by computed fields if needed
    if (sortBy === 'ltv') {
      members.sort((a, b) => sortOrder === 'asc' ? a.ltv - b.ltv : b.ltv - a.ltv);
    } else if (sortBy === 'products_count') {
      members.sort((a, b) => sortOrder === 'asc' ? a.productsOwned - b.productsOwned : b.productsOwned - a.productsOwned);
    } else if (sortBy === 'progress') {
      members.sort((a, b) => sortOrder === 'asc' ? a.overallProgress - b.overallProgress : b.overallProgress - a.overallProgress);
    }

    const response: MembersListResponse = {
      members,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: offset + members.length < (count || 0),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Members API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
