import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSignedUrlAdmin, getLessonContentPath } from '@/lib/supabase/storage';
import { generateSignedVideoUrl, getEmbedUrl } from '@/lib/bunny';

// Helper to create cached JSON response (cache for 50 minutes, URLs expire in 60)
function cachedJsonResponse(data: object) {
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 'private, max-age=3000');
  return response;
}

export async function GET(request: NextRequest) {
  const productSlug = request.nextUrl.searchParams.get('product');
  const moduleSlug = request.nextUrl.searchParams.get('module');
  const lessonSlug = request.nextUrl.searchParams.get('lesson');

  if (!productSlug || !moduleSlug || !lessonSlug) {
    return NextResponse.json(
      { error: 'Missing required parameters: product, module, lesson' },
      { status: 400 }
    );
  }

  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user owns this product
  const { data: purchase } = await supabase
    .from('user_purchases')
    .select(`
      id,
      products!inner(slug)
    `)
    .eq('user_id', user.id)
    .eq('products.slug', productSlug)
    .eq('status', 'active')
    .single();

  if (!purchase) {
    return NextResponse.json(
      { error: 'You do not have access to this content' },
      { status: 403 }
    );
  }

  // Get the lesson details including content_url and content_type
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select(`
      id,
      content_url,
      content_type,
      modules!inner(
        slug,
        products!inner(slug)
      )
    `)
    .eq('slug', lessonSlug)
    .eq('modules.slug', moduleSlug)
    .eq('modules.products.slug', productSlug)
    .single();

  if (lessonError || !lesson) {
    return NextResponse.json(
      { error: 'Lesson not found' },
      { status: 404 }
    );
  }

  const contentType = lesson.content_type as 'video' | 'audio' | 'pdf' | 'text' | 'download';
  const contentUrl = lesson.content_url;

  // Handle different content types
  if (contentType === 'video' || contentType === 'audio') {
    // For video/audio, content_url stores the Bunny video ID
    if (!contentUrl) {
      return NextResponse.json(
        { error: 'Content not yet uploaded' },
        { status: 404 }
      );
    }

    // Check if it's a Bunny video ID (GUID format) or an external URL
    const isBunnyId = /^[a-f0-9-]{36}$/i.test(contentUrl);

    if (isBunnyId) {
      // Generate signed Bunny Stream URL
      const signedUrl = generateSignedVideoUrl(contentUrl, 3600); // 1 hour expiry
      const embedUrl = getEmbedUrl(contentUrl);

      return cachedJsonResponse({
        url: signedUrl,
        embedUrl,
        type: 'bunny',
        contentType,
      });
    } else {
      // External URL (YouTube, Vimeo, etc.) - return as-is
      return cachedJsonResponse({
        url: contentUrl,
        type: 'external',
        contentType,
      });
    }
  } else if (contentType === 'pdf' || contentType === 'download') {
    // For PDFs and downloads, use Supabase Storage
    if (contentUrl) {
      // If content_url is set, use it as the storage path
      const signedUrl = await getSignedUrlAdmin(contentUrl);
      if (signedUrl) {
        return cachedJsonResponse({
          url: signedUrl,
          type: 'supabase',
          contentType,
        });
      }
    }

    // Fall back to conventional path structure
    const path = getLessonContentPath(productSlug, moduleSlug, lessonSlug, contentType);
    const signedUrl = await getSignedUrlAdmin(path);

    if (!signedUrl) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return cachedJsonResponse({
      url: signedUrl,
      type: 'supabase',
      contentType,
    });
  } else {
    // Text content is stored directly in the lesson, no URL needed
    return cachedJsonResponse({
      type: 'text',
      contentType,
    });
  }
}
