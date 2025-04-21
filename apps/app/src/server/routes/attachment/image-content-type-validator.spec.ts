import { describe, test, expect } from 'vitest';

import { validateImageContentType, type SupportedImageMimeType } from './image-content-type-validator';

describe('imageContentTypeValidator', () => {
  describe('validateImageContentType', () => {
    describe('valid cases', () => {
      test.each([
        ['single MIME type', 'image/png'],
        ['MIME type with whitespace', 'image/png '],
        ['multiple MIME types (last is valid)', 'text/html, image/jpeg'],
        ['multiple MIME types with whitespace', 'image/png , image/jpeg'],
      ])('should accept %s', (_, input) => {
        const result = validateImageContentType(input);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      describe('should accept all supported image types', () => {
        const supportedTypes: SupportedImageMimeType[] = [
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

        test.each(supportedTypes)('%s', (mimeType) => {
          const result = validateImageContentType(mimeType);
          expect(result.isValid).toBe(true);
          expect(result.contentType).toBe(mimeType);
          expect(result.error).toBeUndefined();
        });
      });
    });

    describe('invalid cases', () => {
      describe('invalid MIME types', () => {
        test.each([
          ['non-image MIME type', 'application/json'],
          ['multiple MIME types (last is invalid)', 'image/png, text/html'],
          ['empty string', ''],
          ['unknown image type', 'image/unknown'],
        ])('should reject %s', (_, input) => {
          const result = validateImageContentType(input);
          expect(result.isValid).toBe(false);
          expect(result.error).toContain('Invalid file type');
        });
      });

      describe('invalid input types', () => {
        test.each([
          ['undefined', undefined],
          ['null', null],
          ['number', 42],
          ['object', {}],
        ])('should reject %s', (_, input) => {
          const result = validateImageContentType(input as unknown as string);
          expect(result.isValid).toBe(false);
          expect(result.contentType).toBeNull();
          expect(result.error).toBe('Invalid MIME type format');
        });
      });
    });
  });
});
