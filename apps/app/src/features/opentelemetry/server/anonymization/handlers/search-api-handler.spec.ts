import type { IncomingMessage } from 'http';

import {
  describe, it, expect, beforeEach,
} from 'vitest';

import { searchApiModule } from './search-api-handler';

describe('searchApiModule', () => {
  const mockRequest = {} as IncomingMessage;

  beforeEach(() => {
    // No mocks needed - test actual behavior
  });

  describe('canHandle', () => {
    it.each`
      description                     | url                                 | expected
      ${'search API endpoint'}        | ${'/_api/search?q=test'}            | ${true}
      ${'search API without query'}   | ${'/_api/search'}                   | ${true}
      ${'search endpoint'}            | ${'/_search?q=keyword'}             | ${true}
      ${'search endpoint without q'}  | ${'/_search'}                       | ${true}
      ${'nested search API'}          | ${'/admin/_api/search?q=admin'}     | ${true}
      ${'nested search endpoint'}     | ${'/docs/_search?q=documentation'}  | ${true}
      ${'other API endpoint'}         | ${'/_api/pages'}                    | ${false}
      ${'regular page path'}          | ${'/search/results'}                | ${false}
      ${'similar but different'}      | ${'/_api/search-results'}           | ${false}
      ${'root path'}                  | ${'/'}                              | ${false}
      ${'empty URL'}                  | ${''}                               | ${false}
    `('should return $expected for $description: $url', ({ url, expected }) => {
      const result = searchApiModule.canHandle(url);
      expect(result).toBe(expected);
    });
  });

  describe('handle', () => {
    describe('search API with query parameter', () => {
      it('should anonymize search query when q parameter is present', () => {
        const originalUrl = '/_api/search?q=sensitive search term&limit=10';

        const result = searchApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/search?q=%5BANONYMIZED%5D&limit=10',
        });
      });

      it('should handle encoded query parameters', () => {
        const originalUrl = '/_search?q=encoded%20search%20term&sort=relevance';

        const result = searchApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_search?q=%5BANONYMIZED%5D&sort=relevance',
        });
      });

      it('should handle empty query parameter', () => {
        const originalUrl = '/_api/search?q=&page=1';

        const result = searchApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/search?q=%5BANONYMIZED%5D&page=1',
        });
      });

      it('should handle complex query with special characters', () => {
        const originalUrl = '/_search?q=user:john+tag:important&format=json';

        const result = searchApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_search?q=%5BANONYMIZED%5D&format=json',
        });
      });
    });

    describe('search API without query parameter', () => {
      it('should return null when no q parameter is present', () => {
        const url = '/_api/search?limit=20&sort=date';

        const result = searchApiModule.handle(mockRequest, url);

        expect(result).toBeNull();
      });

      it('should return null for search endpoint without query', () => {
        const url = '/_search?page=2&format=json';

        const result = searchApiModule.handle(mockRequest, url);

        expect(result).toBeNull();
      });

      it('should return null for search API without any parameters', () => {
        const url = '/_api/search';

        const result = searchApiModule.handle(mockRequest, url);

        expect(result).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should handle multiple q parameters', () => {
        const originalUrl = '/_api/search?q=first&q=second&limit=5';

        const result = searchApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/search?q=%5BANONYMIZED%5D&limit=5',
        });
      });

      it('should preserve other parameters while anonymizing q', () => {
        const originalUrl = '/_search?category=docs&q=secret&page=1&sort=date';

        const result = searchApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_search?category=docs&q=%5BANONYMIZED%5D&page=1&sort=date',
        });
      });

      it('should handle URLs with fragments', () => {
        const originalUrl = '/_api/search?q=test#results';

        const result = searchApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/search?q=%5BANONYMIZED%5D#results',
        });
      });
    });
  });
});

const mockAnonymizeQueryParams = vi.fn();
vi.mock('../utils/anonymize-query-params', () => ({
  anonymizeQueryParams: mockAnonymizeQueryParams,
}));

describe('searchApiModule', () => {
  const mockRequest = {} as IncomingMessage;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('canHandle', () => {
    it.each`
      description                                  | url                                           | expected
      ${'search API endpoint with _api prefix'}    | ${'/_api/search?q=test'}                      | ${true}
      ${'search API endpoint with _search'}        | ${'/_search?q=test'}                          | ${true}
      ${'search endpoint in URL path'}             | ${'/some/_api/search/endpoint'}               | ${true}
      ${'search endpoint without query'}           | ${'/_api/search'}                             | ${true}
      ${'regular page path'}                       | ${'/page/path'}                               | ${false}
      ${'other API endpoint'}                      | ${'/_api/v3/pages'}                           | ${false}
      ${'root path'}                               | ${'/'}                                        | ${false}
      ${'empty URL'}                               | ${''}                                         | ${false}
      ${'search-like but not exact match'}         | ${'/_api/searchable'}                         | ${false}
      ${'path containing search but not API'}      | ${'/search/page'}                             | ${false}
    `('should return $expected for $description: $url', ({ url, expected }) => {
      const result = searchApiModule.canHandle(url);
      expect(result).toBe(expected);
    });
  });

  describe('handle', () => {
    it('should anonymize search query parameter when q= is present', () => {
      const originalUrl = '/_api/search?q=sensitive search term&limit=10';
      const anonymizedUrl = '/_api/search?q=<ANONYMIZED>&limit=10';

      mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

      const result = searchApiModule.handle(mockRequest, originalUrl);

      expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['q']);
      expect(result).toEqual({
        'http.target': anonymizedUrl,
      });
    });

    it('should handle multiple query parameters correctly', () => {
      const originalUrl = '/_api/search?q=test query&offset=0&limit=20&sort=updated';
      const anonymizedUrl = '/_api/search?q=<ANONYMIZED>&offset=0&limit=20&sort=updated';

      mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

      const result = searchApiModule.handle(mockRequest, originalUrl);

      expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['q']);
      expect(result).toEqual({
        'http.target': anonymizedUrl,
      });
    });

    it('should return null when no q parameter is present', () => {
      const url = '/_api/search?limit=10&offset=0';

      const result = searchApiModule.handle(mockRequest, url);

      expect(mockAnonymizeQueryParams).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null for search URLs without query parameters', () => {
      const url = '/_api/search';

      const result = searchApiModule.handle(mockRequest, url);

      expect(mockAnonymizeQueryParams).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle _search endpoint with query parameter', () => {
      const originalUrl = '/_search?q=document content';
      const anonymizedUrl = '/_search?q=<ANONYMIZED>';

      mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

      const result = searchApiModule.handle(mockRequest, originalUrl);

      expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['q']);
      expect(result).toEqual({
        'http.target': anonymizedUrl,
      });
    });

    it('should handle encoded query parameters', () => {
      const originalUrl = '/_api/search?q=search%20with%20spaces&other=value';
      const anonymizedUrl = '/_api/search?q=<ANONYMIZED>&other=value';

      mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

      const result = searchApiModule.handle(mockRequest, originalUrl);

      expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['q']);
      expect(result).toEqual({
        'http.target': anonymizedUrl,
      });
    });

    it('should handle empty q parameter', () => {
      const originalUrl = '/_api/search?q=&limit=10';
      const anonymizedUrl = '/_api/search?q=<ANONYMIZED>&limit=10';

      mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

      const result = searchApiModule.handle(mockRequest, originalUrl);

      expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['q']);
      expect(result).toEqual({
        'http.target': anonymizedUrl,
      });
    });
  });
});
