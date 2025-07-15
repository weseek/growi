/**
 * Defines default MIME types that are explicitly safe for inline display when served
 * from user uploads. All other types will be forced to download, regardless of
 * their file extension or sniffed content.
 */
export const DEFAULT_ALLOWLIST_MIME_TYPES = new Set<string>([
  // Common Image Types (generally safe for inline display)
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/x-icon',

  // Common Audio Types (generally safe for inline display)
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/aac',
  'audio/webm',

  // Common Video Types (generally safe for inline display)
  'video/mp4',
  'video/webm',
  'video/ogg',

  // Basic Text (generally safe for inline display)
  'text/plain',
  'text/markdown', // Assuming markdown rendering is safe
]);

/**
 * Defines safe MIME types that can be set to inline by the admin.
 * This set includes types that are generally safe, but might be explicitly forced
 * to 'attachment' by default for security or user experience reasons,
 * and the admin has the option to enable inline display.
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
  'image/svg+xml',

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
  'text/markdown',
  'text/css',
  'text/csv',
  'text/tab-separated-values',
  'application/xml', // XML can sometimes be rendered inline, but care is needed
  'application/json',

  // --- Other potentially renderable, but generally safer as attachment by default
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/zip',
  'application/x-rar-compressed',
]);

// Types that are generally NOT safe for inline display and should always default to attachment
export const NOT_SAFE_INLINE_MIME_TYPES = new Set<string>([
  'text/html',
  'text/javascript',
  'application/javascript',
  'application/x-sh',
  'application/x-msdownload',
  'application/octet-stream',
]);

// This set is for internal use to define all configurable types for the API and settings.
// It combines all types that can be handled for disposition settings.
export const CONFIGURABLE_MIME_TYPES_FOR_DISPOSITION = new Set<string>([
  ...DEFAULT_ALLOWLIST_MIME_TYPES,
  ...SAFE_INLINE_CONFIGURABLE_MIME_TYPES,
  ...NOT_SAFE_INLINE_MIME_TYPES,
]);
