import type { IncomingMessage } from 'http';

import {
  describe, it, expect, beforeEach,
} from 'vitest';

import { pageListingApiModule } from './page-listing-api-handler';

describe('pageListingApiModule', () => {
  const mockRequest = {} as IncomingMessage;

  beforeEach(() => {
    // No mocks needed - test actual behavior
  });

  describe('canHandle', () => {
    it.each`
      description                           | url                                                    | expected
      ${'ancestors-children endpoint'}      | ${'/_api/v3/page-listing/ancestors-children?path=/'}  | ${true}
      ${'children endpoint'}                | ${'/_api/v3/page-listing/children?path=/docs'}        | ${true}
      ${'info endpoint'}                    | ${'/_api/v3/page-listing/info?path=/wiki'}            | ${true}
      ${'ancestors-children without query'} | ${'/_api/v3/page-listing/ancestors-children'}         | ${true}
      ${'children without query'}           | ${'/_api/v3/page-listing/children'}                   | ${true}
      ${'info without query'}               | ${'/_api/v3/page-listing/info'}                       | ${true}
      ${'other page-listing endpoint'}      | ${'/_api/v3/page-listing/other'}                      | ${false}
      ${'different API version'}            | ${'/_api/v2/page-listing/children'}                   | ${false}
      ${'non-page-listing API'}             | ${'/_api/v3/pages/list'}                              | ${false}
      ${'regular page path'}                | ${'/page/path'}                                       | ${false}
      ${'root path'}                        | ${'/'}                                                | ${false}
      ${'empty URL'}                        | ${''}                                                 | ${false}
      ${'partial match'}                    | ${'/_api/v3/page-listing-other/children'}             | ${false}
    `('should return $expected for $description: $url', ({ url, expected }) => {
      const result = pageListingApiModule.canHandle(url);
      expect(result).toBe(expected);
    });
  });

  describe('handle', () => {
    describe('ancestors-children endpoint', () => {
      it('should anonymize path parameter when present', () => {
        const originalUrl = '/_api/v3/page-listing/ancestors-children?path=/sensitive/path&limit=10';

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/v3/page-listing/ancestors-children?path=%5BANONYMIZED%5D&limit=10',
        });
      });

      it('should handle encoded path parameters', () => {
        const originalUrl = '/_api/v3/page-listing/ancestors-children?path=%2Fuser%2Fdocs&includeEmpty=true';

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/v3/page-listing/ancestors-children?path=%5BANONYMIZED%5D&includeEmpty=true',
        });
      });

      it('should return null when no path parameter is present', () => {
        const url = '/_api/v3/page-listing/ancestors-children?limit=10&sort=name';

        const result = pageListingApiModule.handle(mockRequest, url);

        expect(result).toBeNull();
      });
    });

    describe('children endpoint', () => {
      it('should anonymize path parameter', () => {
        const originalUrl = '/_api/v3/page-listing/children?path=/project/docs&offset=0';

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/v3/page-listing/children?path=%5BANONYMIZED%5D&offset=0',
        });
      });

      it('should handle root path parameter', () => {
        const originalUrl = '/_api/v3/page-listing/children?path=/&includePrivate=false';

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/v3/page-listing/children?path=%5BANONYMIZED%5D&includePrivate=false',
        });
      });

      it('should return null when no path parameter is present', () => {
        const url = '/_api/v3/page-listing/children?sort=updated&limit=20';

        const result = pageListingApiModule.handle(mockRequest, url);

        expect(result).toBeNull();
      });
    });

    describe('info endpoint', () => {
      it('should anonymize path parameter', () => {
        const originalUrl = '/_api/v3/page-listing/info?path=/wiki/documentation';

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/v3/page-listing/info?path=%5BANONYMIZED%5D',
        });
      });

      it('should handle multiple parameters including path', () => {
        const originalUrl = '/_api/v3/page-listing/info?path=/admin&includeMetadata=true&format=json';

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/v3/page-listing/info?path=%5BANONYMIZED%5D&includeMetadata=true&format=json',
        });
      });

      it('should return null when no path parameter is present', () => {
        const url = '/_api/v3/page-listing/info?includeMetadata=true';

        const result = pageListingApiModule.handle(mockRequest, url);

        expect(result).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should handle empty path parameter', () => {
        const originalUrl = '/_api/v3/page-listing/children?path=&limit=5';

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/v3/page-listing/children?path=%5BANONYMIZED%5D&limit=5',
        });
      });

      it('should handle URLs without any parameters', () => {
        const url = '/_api/v3/page-listing/ancestors-children';

        const result = pageListingApiModule.handle(mockRequest, url);

        expect(result).toBeNull();
      });

      it('should preserve parameter order while anonymizing path', () => {
        const originalUrl = '/_api/v3/page-listing/info?format=json&path=/secret&includeMetadata=true';

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(result).toEqual({
          'http.target': '/_api/v3/page-listing/info?format=json&path=%5BANONYMIZED%5D&includeMetadata=true',
        });
      });
    });
  });
});

const mockAnonymizeQueryParams = vi.fn();
vi.mock('../utils/anonymize-query-params', () => ({
  anonymizeQueryParams: mockAnonymizeQueryParams,
}));

describe('pageListingApiModule', () => {
  const mockRequest = {} as IncomingMessage;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('canHandle', () => {
    it.each`
      description                                          | url                                                          | expected
      ${'ancestors-children endpoint'}                     | ${'/_api/v3/page-listing/ancestors-children?path=/home'}    | ${true}
      ${'children endpoint'}                               | ${'/_api/v3/page-listing/children?path=/docs'}              | ${true}
      ${'info endpoint'}                                   | ${'/_api/v3/page-listing/info?path=/wiki'}                  | ${true}
      ${'ancestors-children without query'}               | ${'/_api/v3/page-listing/ancestors-children'}               | ${true}
      ${'children without query'}                          | ${'/_api/v3/page-listing/children'}                         | ${true}
      ${'info without query'}                              | ${'/_api/v3/page-listing/info'}                             | ${true}
      ${'other page-listing endpoint'}                     | ${'/_api/v3/page-listing/other'}                            | ${false}
      ${'different API version'}                           | ${'/_api/v2/page-listing/children'}                         | ${false}
      ${'non-page-listing API'}                            | ${'/_api/v3/pages/list'}                                     | ${false}
      ${'regular page path'}                               | ${'/page/path'}                                              | ${false}
      ${'root path'}                                       | ${'/'}                                                       | ${false}
      ${'empty URL'}                                       | ${''}                                                        | ${false}
      ${'partial match but different endpoint'}            | ${'/_api/v3/page-listing-other/children'}                   | ${false}
    `('should return $expected for $description: $url', ({ url, expected }) => {
      const result = pageListingApiModule.canHandle(url);
      expect(result).toBe(expected);
    });
  });

  describe('handle', () => {
    describe('ancestors-children endpoint', () => {
      it('should anonymize path parameter', () => {
        const originalUrl = '/_api/v3/page-listing/ancestors-children?path=/sensitive/path&limit=10';
        const anonymizedUrl = '/_api/v3/page-listing/ancestors-children?path=<ANONYMIZED>&limit=10';

        mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['path']);
        expect(result).toEqual({
          'http.target': anonymizedUrl,
        });
      });

      it('should return anonymized URL when no path parameter is present', () => {
        const url = '/_api/v3/page-listing/ancestors-children?limit=10';

        mockAnonymizeQueryParams.mockReturnValue(url);

        const result = pageListingApiModule.handle(mockRequest, url);

        expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(url, ['path']);
        expect(result).toEqual({
          'http.target': url,
        });
      });
    });

    describe('children endpoint', () => {
      it('should anonymize path parameter', () => {
        const originalUrl = '/_api/v3/page-listing/children?path=/user/documents&offset=0';
        const anonymizedUrl = '/_api/v3/page-listing/children?path=<ANONYMIZED>&offset=0';

        mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['path']);
        expect(result).toEqual({
          'http.target': anonymizedUrl,
        });
      });

      it('should handle encoded path parameters', () => {
        const originalUrl = '/_api/v3/page-listing/children?path=%2Fuser%2Fdocs&sort=name';
        const anonymizedUrl = '/_api/v3/page-listing/children?path=<ANONYMIZED>&sort=name';

        mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['path']);
        expect(result).toEqual({
          'http.target': anonymizedUrl,
        });
      });
    });

    describe('info endpoint', () => {
      it('should anonymize path parameter', () => {
        const originalUrl = '/_api/v3/page-listing/info?path=/project/wiki';
        const anonymizedUrl = '/_api/v3/page-listing/info?path=<ANONYMIZED>';

        mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['path']);
        expect(result).toEqual({
          'http.target': anonymizedUrl,
        });
      });

      it('should handle multiple parameters including path', () => {
        const originalUrl = '/_api/v3/page-listing/info?path=/docs/api&includeEmpty=true&format=json';
        const anonymizedUrl = '/_api/v3/page-listing/info?path=<ANONYMIZED>&includeEmpty=true&format=json';

        mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['path']);
        expect(result).toEqual({
          'http.target': anonymizedUrl,
        });
      });
    });

    describe('non-matching URLs', () => {
      it('should return null for URLs that do not match any endpoint', () => {
        const url = '/_api/v3/pages/list?path=/some/path';

        const result = pageListingApiModule.handle(mockRequest, url);

        expect(mockAnonymizeQueryParams).not.toHaveBeenCalled();
        expect(result).toBeNull();
      });

      it('should return null for URLs without page-listing endpoints', () => {
        const url = '/_api/v3/search?q=test';

        const result = pageListingApiModule.handle(mockRequest, url);

        expect(mockAnonymizeQueryParams).not.toHaveBeenCalled();
        expect(result).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('should handle empty path parameter', () => {
        const originalUrl = '/_api/v3/page-listing/children?path=&limit=5';
        const anonymizedUrl = '/_api/v3/page-listing/children?path=<ANONYMIZED>&limit=5';

        mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['path']);
        expect(result).toEqual({
          'http.target': anonymizedUrl,
        });
      });

      it('should handle root path parameter', () => {
        const originalUrl = '/_api/v3/page-listing/ancestors-children?path=/';
        const anonymizedUrl = '/_api/v3/page-listing/ancestors-children?path=<ANONYMIZED>';

        mockAnonymizeQueryParams.mockReturnValue(anonymizedUrl);

        const result = pageListingApiModule.handle(mockRequest, originalUrl);

        expect(mockAnonymizeQueryParams).toHaveBeenCalledWith(originalUrl, ['path']);
        expect(result).toEqual({
          'http.target': anonymizedUrl,
        });
      });
    });
  });
});
