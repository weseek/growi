export const ALL_MIME_TYPES = [
  // Images
  'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/bmp',
  'image/x-icon', 'image/vnd.microsoft.icon', 'image/tiff', 'image/svg+xml',

  // Documents
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'application/rtf',

  // Archives
  'application/zip', 'application/x-7z-compressed', 'application/x-rar-compressed',
  'application/x-tar', 'application/gzip',

  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/flac',

  // Video
  'video/mp4', 'video/webm', 'video/ogg', 'video/x-msvideo', 'video/quicktime',

  // Code
  'text/html', 'text/css', 'application/javascript', 'application/json',
  'application/xml', 'text/markdown', 'application/x-yaml',

  // Fonts
  'font/otf', 'font/ttf', 'font/woff', 'font/woff2', 'application/font-woff',

  // Other
  'application/sql', 'application/vnd.sqlite3', 'application/x-msaccess',
  'application/x-apple-diskimage',
] as const;
