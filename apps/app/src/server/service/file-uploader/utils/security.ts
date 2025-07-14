/**
 * Defines MIME types that are explicitly safe for INLINE display when served
 * from user uploads. All other types will be forced to download, regardless of
 * their file extension or sniffed content.
 */
export const INLINE_ALLOWLIST_MIME_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/x-icon',
]);
