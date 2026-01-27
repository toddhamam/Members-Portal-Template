import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClientInstance } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * POST /api/profile/avatar
 *
 * Upload a profile avatar image.
 * Returns the public URL of the uploaded image.
 *
 * Body: FormData with 'file' field
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PNG, JPEG, WebP' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB' },
        { status: 400 }
      );
    }

    // Generate filename - always overwrite existing avatar
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `avatars/${user.id}.${ext}`;

    const adminSupabase = createAdminClientInstance();

    // Delete old avatar first (if any)
    const { data: existingFiles } = await adminSupabase.storage
      .from('profile-avatars')
      .list('avatars', { search: user.id });

    if (existingFiles && existingFiles.length > 0) {
      await adminSupabase.storage
        .from('profile-avatars')
        .remove(existingFiles.map((f: { name: string }) => `avatars/${f.name}`));
    }

    // Upload new avatar
    const { error: uploadError } = await adminSupabase.storage
      .from('profile-avatars')
      .upload(filename, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('[Profile API] Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = adminSupabase.storage
      .from('profile-avatars')
      .getPublicUrl(filename);

    // Add cache buster to URL
    const avatarUrl = `${publicUrl}?v=${Date.now()}`;

    // Update profile with new avatar URL
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Profile API] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ url: avatarUrl });
  } catch (error) {
    console.error('[Profile API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/profile/avatar
 *
 * Remove the user's profile avatar.
 */
export async function DELETE() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClientInstance();

    // Delete avatar file
    const { data: existingFiles } = await adminSupabase.storage
      .from('profile-avatars')
      .list('avatars', { search: user.id });

    if (existingFiles && existingFiles.length > 0) {
      await adminSupabase.storage
        .from('profile-avatars')
        .remove(existingFiles.map((f: { name: string }) => `avatars/${f.name}`));
    }

    // Clear avatar URL in profile
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id);

    if (updateError) {
      console.error('[Profile API] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Profile API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
