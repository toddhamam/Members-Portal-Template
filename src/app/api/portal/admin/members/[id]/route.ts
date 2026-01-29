import { NextRequest, NextResponse } from 'next/server';
import { createAdminClientInstance, getUser } from '@/lib/supabase/server';
import type { MemberDetailResponse, MemberProductProgress, MemberPurchaseHistory, PurchaseSource, MembershipTier } from '@/lib/admin/types';

/**
 * GET /api/portal/admin/members/[id]
 *
 * Returns detailed member information for the slide-over panel.
 * Requires admin authentication.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;

    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClientInstance();

    // Verify admin status
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (adminError || !adminProfile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch member profile
    const { data: memberProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, first_name, last_name, avatar_url, stripe_customer_id, created_at')
      .eq('id', memberId)
      .single();

    if (profileError || !memberProfile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Fetch all data in parallel
    const [purchasesResult, progressResult, postsResult, commentsResult, reactionsResult] = await Promise.all([
      // Purchases with product details
      supabase
        .from('user_purchases')
        .select(`
          id,
          product_id,
          purchased_at,
          purchase_source,
          products (
            id,
            name,
            slug,
            thumbnail_url,
            price_cents,
            portal_price_cents,
            is_lead_magnet
          )
        `)
        .eq('user_id', memberId)
        .eq('status', 'active')
        .order('purchased_at', { ascending: false }),

      // Lesson progress
      supabase
        .from('lesson_progress')
        .select(`
          lesson_id,
          progress_percent,
          completed_at,
          lessons (
            id,
            title,
            module_id,
            modules (
              id,
              title,
              product_id
            )
          )
        `)
        .eq('user_id', memberId),

      // Posts count
      supabase
        .from('discussion_posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', memberId),

      // Comments count
      supabase
        .from('discussion_comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', memberId),

      // Reactions given
      supabase
        .from('discussion_reactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', memberId),
    ]);

    const purchases = purchasesResult.data || [];
    const progressData = progressResult.data || [];

    // Calculate financials
    let lifetimeValue = 0;
    let funnelSpend = 0;
    let portalSpend = 0;

    // Build purchase history
    const purchaseHistory: MemberPurchaseHistory[] = [];

    // Track if member has any paid (non-lead-magnet) purchases for tier calculation
    let hasPaidPurchase = false;

    for (const purchase of purchases) {
      const product = purchase.products as {
        id: string;
        name: string;
        slug: string;
        thumbnail_url: string | null;
        price_cents: number;
        portal_price_cents: number | null;
        is_lead_magnet: boolean;
      } | null;

      if (!product) continue;

      // Check if this is a paid (non-lead-magnet) purchase
      if (!product.is_lead_magnet) {
        hasPaidPurchase = true;
      }

      const isPortal = purchase.purchase_source === 'portal';
      const priceCents = isPortal && product.portal_price_cents
        ? product.portal_price_cents
        : product.price_cents;
      const priceUsd = priceCents / 100;

      lifetimeValue += priceUsd;

      if (isPortal) {
        portalSpend += priceUsd;
      } else {
        funnelSpend += priceUsd;
      }

      purchaseHistory.push({
        productName: product.name,
        productSlug: product.slug,
        amount: priceUsd,
        purchasedAt: purchase.purchased_at,
        source: (purchase.purchase_source || 'funnel') as PurchaseSource,
      });
    }

    // Build products with progress
    // First, get all lessons for owned products to calculate total lessons
    const ownedProductIds = purchases.map((p: { products: { id: string } | null }) => {
      const product = p.products as { id: string } | null;
      return product?.id;
    }).filter(Boolean) as string[];

    const { data: allLessons } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        module_id,
        modules!inner (
          id,
          title,
          product_id
        )
      `)
      .in('modules.product_id', ownedProductIds)
      .eq('is_published', true);

    // Group lessons by product
    const lessonsByProduct = new Map<string, Array<{
      lessonId: string;
      lessonTitle: string;
      moduleId: string;
      moduleTitle: string;
    }>>();

    for (const lesson of allLessons || []) {
      const lessonModule = lesson.modules as { id: string; title: string; product_id: string };
      const productId = lessonModule.product_id;

      if (!lessonsByProduct.has(productId)) {
        lessonsByProduct.set(productId, []);
      }

      lessonsByProduct.get(productId)!.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        moduleId: lessonModule.id,
        moduleTitle: lessonModule.title,
      });
    }

    // Build progress by lesson
    const progressByLesson = new Map<string, { progress: number; completedAt: string | null }>();
    for (const p of progressData) {
      progressByLesson.set(p.lesson_id, {
        progress: p.progress_percent,
        completedAt: p.completed_at,
      });
    }

    // Build products array with progress
    type PurchaseWithProduct = {
      id: string;
      product_id: string;
      purchased_at: string;
      purchase_source: string | null;
      products: {
        id: string;
        name: string;
        slug: string;
        thumbnail_url: string | null;
        price_cents: number;
        portal_price_cents: number | null;
      } | null;
    };

    const products: MemberProductProgress[] = (purchases as PurchaseWithProduct[]).map((purchase) => {
      const product = purchase.products;

      if (!product) {
        return null;
      }

      const productLessons = lessonsByProduct.get(product.id) || [];
      const totalLessons = productLessons.length;

      // Group by module
      const moduleMap = new Map<string, {
        moduleId: string;
        moduleTitle: string;
        lessons: Array<{
          lessonId: string;
          lessonTitle: string;
          progressPercent: number;
          completedAt: string | null;
        }>;
      }>();

      let totalProgress = 0;
      let lessonsCompleted = 0;

      for (const lesson of productLessons) {
        if (!moduleMap.has(lesson.moduleId)) {
          moduleMap.set(lesson.moduleId, {
            moduleId: lesson.moduleId,
            moduleTitle: lesson.moduleTitle,
            lessons: [],
          });
        }

        const lessonProgress = progressByLesson.get(lesson.lessonId);
        const progressPercent = lessonProgress?.progress || 0;
        const completedAt = lessonProgress?.completedAt || null;

        totalProgress += progressPercent;
        if (progressPercent >= 100) {
          lessonsCompleted++;
        }

        moduleMap.get(lesson.moduleId)!.lessons.push({
          lessonId: lesson.lessonId,
          lessonTitle: lesson.lessonTitle,
          progressPercent,
          completedAt,
        });
      }

      const overallProgress = totalLessons > 0 ? totalProgress / totalLessons : 0;

      return {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        thumbnailUrl: product.thumbnail_url,
        purchasedAt: purchase.purchased_at,
        purchaseSource: (purchase.purchase_source || 'funnel') as PurchaseSource,
        progressPercent: overallProgress,
        lessonsCompleted,
        totalLessons,
        modules: Array.from(moduleMap.values()),
      };
    }).filter(Boolean) as MemberProductProgress[];

    // Determine membership tier
    const membershipTier: MembershipTier = hasPaidPurchase ? 'paid' : 'free';

    // Build response
    const response: MemberDetailResponse = {
      profile: {
        id: memberProfile.id,
        email: memberProfile.email,
        fullName: memberProfile.full_name,
        firstName: memberProfile.first_name,
        lastName: memberProfile.last_name,
        avatarUrl: memberProfile.avatar_url,
        stripeCustomerId: memberProfile.stripe_customer_id,
        joinedAt: memberProfile.created_at,
        membershipTier,
      },
      financials: {
        lifetimeValue,
        funnelSpend,
        portalSpend,
      },
      products,
      purchaseHistory,
      communityStats: {
        postsCount: postsResult.count || 0,
        commentsCount: commentsResult.count || 0,
        reactionsGiven: reactionsResult.count || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Member Detail API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
