import { describe, test, expect } from 'vitest';

import { validateImageContentType } from './image-content-type-validator';

describe('imageContentTypeValidator', () => {
  describe('validateImageContentType', () => {
    test('should accept valid single MIME type', () => {
      const result = validateImageContentType('image/png');
      expect(result.isValid).toBe(true);
      expect(result.contentType).toBe('image/png');
      expect(result.error).toBeUndefined();
    });

    test('should accept valid MIME type when multiple types are provided (last type is valid)', () => {
      const result = validateImageContentType('text/html, image/jpeg');
      expect(result.isValid).toBe(true);
      expect(result.contentType).toBe('image/jpeg');
      expect(result.error).toBeUndefined();
    });

    test('should reject when last MIME type is invalid', () => {
      const result = validateImageContentType('image/png, text/html');
      expect(result.isValid).toBe(false);
      expect(result.contentType).toBe('text/html');
      expect(result.error).toContain('Invalid file type');
    });

    test('should handle empty string', () => {
      const result = validateImageContentType('');
      expect(result.isValid).toBe(false);
      expect(result.contentType).toBe('');
      expect(result.error).toContain('Invalid file type');
    });

    test('should handle whitespace in MIME types', () => {
      const result = validateImageContentType('image/png , image/jpeg');
      expect(result.isValid).toBe(true);
      expect(result.contentType).toBe('image/jpeg');
      expect(result.error).toBeUndefined();
    });

    test('should reject non-image MIME types', () => {
      const result = validateImageContentType('application/json');
      expect(result.isValid).toBe(false);
      expect(result.contentType).toBe('application/json');
      expect(result.error).toContain('Invalid file type');
    });

    test('should reject non-string input', () => {
      const result = validateImageContentType(undefined as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.contentType).toBeNull();
      expect(result.error).toBe('Invalid MIME type format');
    });

    test('should accept all supported image types', () => {
      const supportedTypes = [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/webp',
        'image/avif',
        'image/heic',
        'image/heif',
        'image/tiff',
        'image/svg+xml',
      ];

      // Use for...of instead of forEach to avoid extra argument
      for (const mimeType of supportedTypes) {
        const result = validateImageContentType(mimeType);
        expect(result.isValid).toBe(true, `${mimeType} should be valid`);
        expect(result.contentType).toBe(mimeType);
        expect(result.error).toBeUndefined();
      }
    });
  });
});
