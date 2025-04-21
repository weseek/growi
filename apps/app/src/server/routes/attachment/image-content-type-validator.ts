/**
 * Define supported image MIME types
 */
export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/png', // Universal web format
  'image/jpeg', // Universal web format
  'image/jpg', // Universal web format
  'image/gif', // Universal web format
  'image/webp', // Modern efficient format
  'image/avif', // Next-gen format
  'image/heic', // iOS format
  'image/heif', // iOS format
  'image/tiff', // High quality format
  'image/svg+xml', // Vector format
] as const;

// Create a type for supported MIME types
export type SupportedImageMimeType = typeof SUPPORTED_IMAGE_MIME_TYPES[number];

export interface ImageContentTypeValidatorResult {
  isValid: boolean;
  contentType: string | null;
  error?: string;
}

/**
 * Validate and extract content type from MIME type string
 * @param mimeType MIME type string, possibly containing multiple values
 * @returns Validation result containing isValid flag and extracted content type
 */
export const validateImageContentType = (mimeType: string): ImageContentTypeValidatorResult => {
  if (typeof mimeType !== 'string') {
    return {
      isValid: false,
      contentType: null,
      error: 'Invalid MIME type format',
    };
  }

  // Extract the last content type from comma-separated values
  const contentType = mimeType.split(',')
    .map(type => type.trim())
    .pop() ?? '';

  // Check if the content type is in supported list
  const isValid = SUPPORTED_IMAGE_MIME_TYPES.includes(contentType as SupportedImageMimeType);

  if (!isValid) {
    const supportedFormats = 'PNG, JPEG, GIF, WebP, AVIF, HEIC/HEIF, TIFF, SVG';
    return {
      isValid: false,
      contentType,
      error: `Invalid file type. Supported formats: ${supportedFormats}`,
    };
  }

  return {
    isValid: true,
    contentType,
  };
};
