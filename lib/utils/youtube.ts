/**
 * Extract YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    // Remove whitespace
    const cleanUrl = url.trim();

    // Pattern 1: youtu.be/VIDEO_ID
    const shortPattern = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const shortMatch = cleanUrl.match(shortPattern);
    if (shortMatch) return shortMatch[1];

    // Pattern 2: youtube.com/watch?v=VIDEO_ID
    const watchPattern = /[?&]v=([a-zA-Z0-9_-]{11})/;
    const watchMatch = cleanUrl.match(watchPattern);
    if (watchMatch) return watchMatch[1];

    // Pattern 3: youtube.com/embed/VIDEO_ID
    const embedPattern = /\/embed\/([a-zA-Z0-9_-]{11})/;
    const embedMatch = cleanUrl.match(embedPattern);
    if (embedMatch) return embedMatch[1];

    // Pattern 4: youtube.com/v/VIDEO_ID
    const vPattern = /\/v\/([a-zA-Z0-9_-]{11})/;
    const vMatch = cleanUrl.match(vPattern);
    if (vMatch) return vMatch[1];

    return null;
  } catch (error) {
    console.error("Error extracting YouTube video ID:", error);
    return null;
  }
}

/**
 * Get YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Check if a URL is a valid YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  const youtubePattern = /(youtube\.com|youtu\.be)/;
  return youtubePattern.test(url);
}
