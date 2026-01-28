import { NextRequest, NextResponse } from 'next/server';
import { createAdminClientInstance } from '@/lib/supabase/server';

/**
 * GET /api/dashboard/debug
 *
 * Debug endpoint to diagnose funnel tracking issues.
 * Returns information about:
 * - Environment variable status
 * - Database connectivity
 * - Recent funnel events
 */
export async function GET(request: NextRequest) {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {},
    database: {},
    recentEvents: {},
  };

  // Check environment variables
  diagnostics.environment = {
    SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY_SET: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_WEBHOOK_SECRET_SET: !!process.env.STRIPE_WEBHOOK_SECRET,
  };

  // Test database connectivity with admin client
  try {
    const supabase = createAdminClientInstance();

    // Test 1: Check if we can query the funnel_events table
    const { data: tableCheck, error: tableError } = await supabase
      .from('funnel_events')
      .select('id')
      .limit(1);

    if (tableError) {
      diagnostics.database = {
        status: 'ERROR',
        error: tableError.message,
        code: tableError.code,
        hint: tableError.hint,
        tableExists: false,
      };
    } else {
      diagnostics.database = {
        status: 'OK',
        tableExists: true,
        canQuery: true,
      };

      // Test 2: Count events by type
      const { data: eventCounts, error: countError } = await supabase
        .from('funnel_events')
        .select('event_type')
        .limit(1000);

      if (!countError && eventCounts) {
        const counts = eventCounts.reduce((acc: Record<string, number>, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {});

        diagnostics.recentEvents = {
          total: eventCounts.length,
          byType: counts,
        };
      }

      // Test 3: Get recent purchase events
      const { data: recentPurchases, error: purchaseError } = await supabase
        .from('funnel_events')
        .select('id, event_type, funnel_step, revenue_cents, created_at, visitor_id')
        .in('event_type', ['purchase', 'upsell_accept', 'downsell_accept'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (!purchaseError) {
        diagnostics.recentPurchases = recentPurchases?.map(p => ({
          id: p.id,
          eventType: p.event_type,
          funnelStep: p.funnel_step,
          revenue: p.revenue_cents ? `$${p.revenue_cents / 100}` : '$0',
          createdAt: p.created_at,
          isServerSide: p.visitor_id?.startsWith('server-'),
        }));
      }

      // Test 4: Get recent page_view events (to compare)
      const { data: recentViews, error: viewError } = await supabase
        .from('funnel_events')
        .select('funnel_step, created_at')
        .eq('event_type', 'page_view')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!viewError) {
        diagnostics.recentPageViews = recentViews?.map(v => ({
          funnelStep: v.funnel_step,
          createdAt: v.created_at,
        }));
      }

      // Test 5: Try a test insert (then delete it)
      const testId = `test-${Date.now()}`;
      const { error: insertError } = await supabase
        .from('funnel_events')
        .insert({
          visitor_id: testId,
          funnel_session_id: testId,
          event_type: 'page_view',
          funnel_step: 'landing',
          ip_hash: 'test',
        });

      if (insertError) {
        diagnostics.insertTest = {
          status: 'FAILED',
          error: insertError.message,
          code: insertError.code,
        };
      } else {
        // Clean up test record
        await supabase
          .from('funnel_events')
          .delete()
          .eq('visitor_id', testId);

        diagnostics.insertTest = {
          status: 'OK',
          canInsert: true,
        };
      }

      // Test 6: Check profiles table access
      const { data: recentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (profilesError) {
        diagnostics.profiles = {
          status: 'ERROR',
          error: profilesError.message,
          code: profilesError.code,
        };
      } else {
        diagnostics.profiles = {
          status: 'OK',
          recentCount: recentProfiles?.length || 0,
          recent: recentProfiles?.map(p => ({
            id: p.id.substring(0, 8) + '...',
            email: p.email,
            createdAt: p.created_at,
          })),
        };
      }

      // Test 7: Check products table
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, slug, name')
        .limit(10);

      if (productsError) {
        diagnostics.products = {
          status: 'ERROR',
          error: productsError.message,
          code: productsError.code,
        };
      } else {
        diagnostics.products = {
          status: 'OK',
          count: products?.length || 0,
          list: products?.map(p => ({ slug: p.slug, name: p.name })),
        };
      }

      // Test 8: Check user_purchases table
      const { data: recentPurchasesDb, error: purchasesError } = await supabase
        .from('user_purchases')
        .select('id, product_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (purchasesError) {
        diagnostics.userPurchases = {
          status: 'ERROR',
          error: purchasesError.message,
          code: purchasesError.code,
        };
      } else {
        diagnostics.userPurchases = {
          status: 'OK',
          recentCount: recentPurchasesDb?.length || 0,
          recent: recentPurchasesDb?.map(p => ({
            id: p.id.substring(0, 8) + '...',
            productId: p.product_id,
            status: p.status,
            createdAt: p.created_at,
          })),
        };
      }

      // Test 9: Check if auth.admin works
      try {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
          page: 1,
          perPage: 1,
        });

        if (authError) {
          diagnostics.authAdmin = {
            status: 'ERROR',
            error: authError.message,
          };
        } else {
          diagnostics.authAdmin = {
            status: 'OK',
            canListUsers: true,
            totalUsers: authUsers?.users?.length || 0,
          };
        }
      } catch (authAdminError) {
        diagnostics.authAdmin = {
          status: 'EXCEPTION',
          error: authAdminError instanceof Error ? authAdminError.message : 'Unknown error',
        };
      }
    }
  } catch (error) {
    diagnostics.database = {
      status: 'EXCEPTION',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
