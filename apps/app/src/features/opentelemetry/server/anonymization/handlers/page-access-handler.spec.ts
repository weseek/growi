import type { IncomingMessage } from 'http';

import { describe, it, expect } from 'vitest';

import { pageAccessModule } from './page-access-handler';

describe('pageAccessModule', () => {
  describe('canHandle', () => {
    it.each`
      description                   | url                            | expected
      ${'root path'}                | ${'/'}                         | ${false}
      ${'API endpoint'}             | ${'/_api/v3/search'}           | ${false}
      ${'static resource'}          | ${'/static/css/style.css'}     | ${false}
      ${'favicon'}                  | ${'/favicon.ico'}              | ${false}
      ${'assets'}                   | ${'/assets/image.png'}         | ${false}
      ${'Next.js resource'}         | ${'/_next/chunk.js'}           | ${false}
      ${'file with extension'}      | ${'/file.pdf'}                 | ${false}
      ${'Users top page'}           | ${'/user'}                     | ${false}
      ${'Users homepage'}           | ${'/user/john'}                | ${true}
      ${'Users page'}               | ${'/user/john/projects'}       | ${true}
      ${'page path'}                | ${'/path/to/page'}             | ${true}
      ${'ObjectId path'}            | ${'/58a4569921a8424d00a1aa0e'} | ${false}
      `('should return $expected for $description', ({ url, expected }) => {
      const result = pageAccessModule.canHandle(url);
      expect(result).toBe(expected);
    });
  });

  describe('handle', () => {
    describe('URL path anonymization', () => {
      it.each`
        description                     | url                                 | expectedPath
        ${'root path'}                  | ${'/'}                              | ${null}
        ${'empty path'}                 | ${''}                               | ${null}
        ${'Users homepage'}             | ${'/user/john'}                     | ${'/user/[USERNAME_HASHED:96d9632f363564cc]'}
        ${'regular page path'}          | ${'/user/john/projects'}            | ${'/user/[USERNAME_HASHED:96d9632f363564cc]/[HASHED:2577c0f557b2e4b5]'}
        ${'Japanese page path'}         | ${'/path/to/ページ'}                | ${'/[HASHED:691184f7b886e43b]'}
        ${'complex path'}               | ${'/wiki/project/documentation'}    | ${'/[HASHED:22ca1a8b9f281349]'}
        ${'path with special chars'}    | ${'/user-name_123/project!'}        | ${'/[HASHED:7aa6a8f4468baa96]'}
        ${'ObjectId path'}              | ${'/58a4569921a8424d00a1aa0e'}      | ${null}
      `('should handle $description', ({ url, expectedPath }) => {
        const mockRequest = {} as IncomingMessage;
        const result = pageAccessModule.handle(mockRequest, url);

        if (expectedPath === null) {
          expect(result).toBeNull();
        }
        else {
          expect(result).toEqual({
            'http.target': expectedPath,
          });
        }
      });
    });

    it('should preserve query parameters', () => {
      const mockRequest = {} as IncomingMessage;
      const url = '/user/john?tab=projects&sort=date';
      const result = pageAccessModule.handle(mockRequest, url);

      expect(result).toEqual({
        'http.target': '/user/[USERNAME_HASHED:96d9632f363564cc]?tab=projects&sort=date',
      });
    });

    it('should handle complex query parameters', () => {
      const mockRequest = {} as IncomingMessage;
      const url = '/wiki/page?search=test&tags[]=tag1&tags[]=tag2&limit=10';
      const result = pageAccessModule.handle(mockRequest, url);

      expect(result).toEqual({
        'http.target': '/[HASHED:2f4a824f8eacbc70]?search=test&tags[]=tag1&tags[]=tag2&limit=10',
      });
    });

    it('should handle invalid URLs gracefully', () => {
      const mockRequest = {} as IncomingMessage;
      const invalidUrl = 'not-a-valid-url';
      const result = pageAccessModule.handle(mockRequest, invalidUrl);

      // The function should return anonymized result even for invalid URLs
      // as it tries to process them as paths
      expect(result).toEqual({
        'http.target': '/[HASHED:66df542c298792e1]',
      });
    });

    it('should handle URL parsing errors gracefully', () => {
      const mockRequest = {} as IncomingMessage;
      // This should trigger an error in URL parsing and return null
      const result = pageAccessModule.handle(mockRequest, 'http://[invalid');

      expect(result).toBeNull();
    });
  });
});
