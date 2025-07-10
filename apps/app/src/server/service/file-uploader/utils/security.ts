/**
 * Defines default MIME types that are explicitly safe for inline display when served
 * from user uploads. All other types will be forced to download, regardless of
 * their file extension or sniffed content.
 */
export const DEFAULT_ALLOWLIST_MIME_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/x-icon',
]);

/**
 * Defines safe MIME types that can be set to inline by the admin.
 */
export const SAFE_INLINE_CONFIGURABLE_MIME_TYPES = new Set<string>([
  // --- Images ---
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/x-icon',

  // --- Audio ---
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/aac',
  'audio/webm',

  // --- Video ---
  'video/mp4',
  'video/webm',
  'video/ogg',

  // --- Documents / Text ---
  'application/pdf',
  'text/plain',
  'text/markdown', // Assumes GROWI's markdown rendering is safe and isolated
  'text/css',
  'text/csv',
  'text/tab-separated-values',
]);
