import { createClient } from './client';
import { createAdminClientInstance } from './server';

const BUCKET_NAME = 'premium-content';
const SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

/**
 * Get a signed URL for accessing premium content
 * Client-side version - requires user to be authenticated
 */
export async function getSignedUrl(path: string): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error) {
    console.error('Failed to create signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Get a signed URL for accessing premium content
 * Server-side version using admin client - bypasses RLS
 */
export async function getSignedUrlAdmin(path: string): Promise<string | null> {
  const supabase = createAdminClientInstance();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error) {
    console.error('Failed to create signed URL (admin):', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Get content URL for a lesson based on product slug and lesson info
 * Returns the storage path format: {product-slug}/{module-slug}/{lesson-slug}.{ext}
 */
export function getLessonContentPath(
  productSlug: string,
  moduleSlug: string,
  lessonSlug: string,
  contentType: 'video' | 'audio' | 'pdf' | 'download'
): string {
  const extension = getExtension(contentType);
  return `${productSlug}/${moduleSlug}/${lessonSlug}.${extension}`;
}

function getExtension(contentType: string): string {
  switch (contentType) {
    case 'video':
      return 'mp4';
    case 'audio':
      return 'mp3';
    case 'pdf':
    case 'download':
      return 'pdf';
    default:
      return 'mp4';
  }
}

/**
 * Check if a file exists in storage
 */
export async function fileExists(path: string): Promise<boolean> {
  const supabase = createAdminClientInstance();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(path.split('/').slice(0, -1).join('/'), {
      search: path.split('/').pop(),
    });

  if (error) {
    console.error('Failed to check file existence:', error);
    return false;
  }

  return data.length > 0;
}

/**
 * Upload a file to premium content storage
 * Server-side only - requires service role
 */
export async function uploadContent(
  path: string,
  file: File | Blob,
  contentType: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClientInstance();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error('Failed to upload content:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
