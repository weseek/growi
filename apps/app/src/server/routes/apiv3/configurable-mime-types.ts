export const CONFIGURABLE_MIME_TYPES_FOR_DISPOSITION = [
  // Common Image Types
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/x-icon',

  // Document & Media Types
  'application/pdf',
  'text/plain',
  'video/mp4',
  'video/webm',
  'video/ogg',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',

  // Potentially Dangerous / Executable / Scriptable Types (defaulting to attachment for security)
  'text/html',
  'text/javascript',
  'application/javascript',
  'image/svg+xml',
  'application/xml',
  'application/json',
  'application/x-sh', // Shell scripts
  'application/x-msdownload', // Executables
  'application/octet-stream', // Generic binary

  // Other Common Document Formats (often better as attachment)
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/zip',
  'application/x-rar-compressed',
  'text/csv',
];
