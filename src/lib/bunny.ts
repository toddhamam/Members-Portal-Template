import crypto from 'crypto';

// Bunny Stream configuration
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY!;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME!;
const BUNNY_TOKEN_KEY = process.env.BUNNY_TOKEN_KEY!; // For signed URLs

const BUNNY_API_BASE = 'https://video.bunnycdn.com/library';

/**
 * Generate a signed URL for video playback
 * This URL expires after the specified time, preventing unauthorized sharing
 */
export function generateSignedVideoUrl(
  videoId: string,
  expiresInSeconds: number = 3600 // 1 hour default
): string {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const path = `/${videoId}/playlist.m3u8`;

  // Generate token hash: SHA256(token_key + path + expires)
  const hashInput = BUNNY_TOKEN_KEY + path + expires;
  const token = crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('hex');

  return `https://${BUNNY_CDN_HOSTNAME}${path}?token=${token}&expires=${expires}`;
}

/**
 * Generate a signed URL for video thumbnail
 */
export function generateSignedThumbnailUrl(
  videoId: string,
  expiresInSeconds: number = 86400 // 24 hours for thumbnails
): string {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const path = `/${videoId}/thumbnail.jpg`;

  const hashInput = BUNNY_TOKEN_KEY + path + expires;
  const token = crypto
    .createHash('sha256')
    .update(hashInput)
    .digest('hex');

  return `https://${BUNNY_CDN_HOSTNAME}${path}?token=${token}&expires=${expires}`;
}

/**
 * Get video details from Bunny Stream API
 */
export async function getVideo(videoId: string) {
  const response = await fetch(
    `${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get video: ${response.statusText}`);
  }

  return response.json();
}

/**
 * List all videos in the library
 */
export async function listVideos(page: number = 1, itemsPerPage: number = 100) {
  const response = await fetch(
    `${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${itemsPerPage}`,
    {
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list videos: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new video (returns upload URL)
 */
export async function createVideo(title: string) {
  const response = await fetch(
    `${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: 'POST',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create video: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a video
 */
export async function deleteVideo(videoId: string) {
  const response = await fetch(
    `${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoId}`,
    {
      method: 'DELETE',
      headers: {
        'AccessKey': BUNNY_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to delete video: ${response.statusText}`);
  }

  return true;
}

/**
 * Get the embed iframe HTML for a video
 */
export function getEmbedHtml(videoId: string): string {
  return `<iframe src="https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}"
    loading="lazy"
    style="border:none;position:absolute;top:0;height:100%;width:100%;"
    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
    allowfullscreen="true">
  </iframe>`;
}

/**
 * Get the direct embed URL for use in video players
 */
export function getEmbedUrl(videoId: string, options?: { autoplay?: boolean }): string {
  const autoplay = options?.autoplay ?? false;
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?autoplay=${autoplay}`;
}
