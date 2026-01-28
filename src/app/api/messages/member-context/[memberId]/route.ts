import { NextRequest, NextResponse } from "next/server";
import { createAdminClientInstance, getUser } from "@/lib/supabase/server";

/**
 * GET /api/messages/member-context/[memberId]
 *
 * Returns member context for display in chat window sidebar.
 * Requires admin authentication.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;

    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClientInstance();

    // Verify admin status
    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (adminError || !adminProfile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch member profile
    const { data: memberProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, created_at")
      .eq("id", memberId)
      .single();

    if (profileError || !memberProfile) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Fetch data in parallel
    const [purchasesResult, progressResult, postsResult, commentsResult, lastActiveResult] = await Promise.all([
      // Purchases with product details
      supabase
        .from("user_purchases")
        .select(`
          id,
          product_id,
          purchased_at,
          purchase_source,
          products (
            id,
            name,
            slug,
            price_cents,
            portal_price_cents
          )
        `)
        .eq("user_id", memberId)
        .eq("status", "active")
        .order("purchased_at", { ascending: false }),

      // Lesson progress (simplified)
      supabase
        .from("lesson_progress")
        .select("lesson_id, progress_percent, completed_at")
        .eq("user_id", memberId),

      // Posts count
      supabase
        .from("discussion_posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", memberId),

      // Comments count
      supabase
        .from("discussion_comments")
        .select("id", { count: "exact", head: true })
        .eq("author_id", memberId),

      // Last activity (most recent post or comment)
      supabase
        .from("discussion_posts")
        .select("created_at")
        .eq("author_id", memberId)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    const purchases = purchasesResult.data || [];
    const progressData = progressResult.data || [];

    // Calculate lifetime value
    let lifetimeValue = 0;
    const productsList: Array<{
      name: string;
      slug: string;
      purchasedAt: string;
      source: string;
      amount: number;
    }> = [];

    for (const purchase of purchases) {
      const product = purchase.products as {
        id: string;
        name: string;
        slug: string;
        price_cents: number;
        portal_price_cents: number | null;
      } | null;

      if (!product) continue;

      const isPortal = purchase.purchase_source === "portal";
      const priceCents = isPortal && product.portal_price_cents
        ? product.portal_price_cents
        : product.price_cents;
      const priceUsd = priceCents / 100;

      lifetimeValue += priceUsd;

      productsList.push({
        name: product.name,
        slug: product.slug,
        purchasedAt: purchase.purchased_at,
        source: purchase.purchase_source || "funnel",
        amount: priceUsd,
      });
    }

    // Calculate average progress
    interface ProgressEntry {
      lesson_id: string;
      progress_percent: number;
      completed_at: string | null;
    }
    const completedLessons = progressData.filter((p: ProgressEntry) => p.progress_percent >= 100).length;
    const totalProgress = progressData.reduce((sum: number, p: ProgressEntry) => sum + p.progress_percent, 0);
    const avgProgress = progressData.length > 0 ? totalProgress / progressData.length : 0;

    // Build response
    const response = {
      profile: {
        id: memberProfile.id,
        email: memberProfile.email,
        fullName: memberProfile.full_name,
        avatarUrl: memberProfile.avatar_url,
        joinedAt: memberProfile.created_at,
      },
      stats: {
        lifetimeValue,
        productsOwned: productsList.length,
        lessonsCompleted: completedLessons,
        averageProgress: Math.round(avgProgress),
        postsCount: postsResult.count || 0,
        commentsCount: commentsResult.count || 0,
      },
      products: productsList,
      lastActiveAt: lastActiveResult.data?.[0]?.created_at || null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Member Context API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
