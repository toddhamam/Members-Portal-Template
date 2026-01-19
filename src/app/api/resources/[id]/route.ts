import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClientInstance } from '@/lib/supabase/server';

const BUCKET_NAME = 'lesson-content';
const SIGNED_URL_EXPIRY = 3600; // 1 hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: resourceId } = await params;

  if (!resourceId) {
    return NextResponse.json(
      { error: 'Resource ID is required' },
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

  // Get the resource details
  const { data: resource, error: resourceError } = await supabase
    .from('lesson_resources')
    .select('id, file_url, title')
    .eq('id', resourceId)
    .single();

  if (resourceError || !resource) {
    console.error('Resource lookup failed:', resourceError);
    return NextResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    );
  }

  if (!resource.file_url) {
    return NextResponse.json(
      { error: 'Resource file not available' },
      { status: 404 }
    );
  }

  // Generate signed URL using admin client
  const adminClient = createAdminClientInstance();

  try {
    // Ensure the download filename has the correct extension
    const fileExtension = resource.file_url.split('.').pop() || '';
    let downloadFilename = resource.title || resource.file_url;

    // Add extension if the title doesn't already have it
    if (fileExtension && !downloadFilename.toLowerCase().endsWith(`.${fileExtension.toLowerCase()}`)) {
      downloadFilename = `${downloadFilename}.${fileExtension}`;
    }

    const { data, error: urlError } = await adminClient.storage
      .from(BUCKET_NAME)
      .createSignedUrl(resource.file_url, SIGNED_URL_EXPIRY, {
        download: downloadFilename,
      });

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return NextResponse.json(
        { error: `Failed to generate download URL: ${urlError.message}` },
        { status: 500 }
      );
    }

    if (!data?.signedUrl) {
      console.error('No signed URL returned');
      return NextResponse.json(
        { error: 'Failed to generate download URL - no URL returned' },
        { status: 500 }
      );
    }

    console.log('Generated signed URL for:', resource.file_url);
    console.log('Signed URL:', data.signedUrl);

    return NextResponse.json({
      url: data.signedUrl,
      filename: resource.title || resource.file_url,
    });
  } catch (err) {
    console.error('Unexpected error generating signed URL:', err);
    return NextResponse.json(
      { error: 'Unexpected error generating download URL' },
      { status: 500 }
    );
  }
}
