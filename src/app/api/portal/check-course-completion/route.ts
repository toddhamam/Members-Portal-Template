import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';
import { triggerCourseCompleted } from '@/lib/dm-automation';

/**
 * POST /api/portal/check-course-completion
 *
 * Checks if a user has completed all lessons in a product/course.
 * If so, triggers the course_completed automation.
 *
 * Body:
 * - productId: The product ID to check
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClientInstance();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // Get all lessons for this product
    const { data: lessons, error: lessonsError } = await adminSupabase
      .from('lessons')
      .select(`
        id,
        modules!inner(product_id)
      `)
      .eq('modules.product_id', productId);

    if (lessonsError) {
      console.error('[Check Course Completion] Error fetching lessons:', lessonsError);
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }

    if (!lessons || lessons.length === 0) {
      return NextResponse.json({ completed: false, message: 'No lessons found' });
    }

    const lessonIds = lessons.map((l: { id: string }) => l.id);

    // Get user's completed lessons for this product
    const { data: progress, error: progressError } = await adminSupabase
      .from('lesson_progress')
      .select('lesson_id, completed_at')
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds)
      .not('completed_at', 'is', null);

    if (progressError) {
      console.error('[Check Course Completion] Error fetching progress:', progressError);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    const completedCount = progress?.length || 0;
    const totalLessons = lessons.length;
    const isCompleted = completedCount >= totalLessons;

    console.log(`[Check Course Completion] User ${user.id} - Product ${productId}: ${completedCount}/${totalLessons} lessons complete`);

    if (isCompleted) {
      // Get product name for the automation
      const { data: product } = await adminSupabase
        .from('products')
        .select('id, name')
        .eq('id', productId)
        .single();

      if (product) {
        console.log(`[Check Course Completion] Course completed! Triggering automation for user ${user.id}`);
        // Run in background - don't block the response
        triggerCourseCompleted(user.id, product.id, product.name).catch((err) => {
          console.error('[Check Course Completion] Error triggering automation:', err);
        });
      }
    }

    return NextResponse.json({
      completed: isCompleted,
      completedCount,
      totalLessons,
    });
  } catch (error) {
    console.error('[Check Course Completion] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
