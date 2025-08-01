/**
 * Unit tests for nextjs-routing-utils.ts
 *
 * This test suite covers:
 * - useNextjsRoutingPageRegister hook functionality
 * - detectNextjsRoutingType function with various routing scenarios
 * - Edge cases and error handling
 *
 * @vitest-environment happy-dom
 */

import { renderHook } from '@testing-library/react';
import Cookies from 'js-cookie';
import { type GetServerSidePropsContext } from 'next';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

import { useNextjsRoutingPageRegister, detectNextjsRoutingType } from './nextjs-routing-utils';

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockCookies = vi.mocked(Cookies);

describe('nextjs-routing-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useNextjsRoutingPageRegister', () => {
    it('should set cookie when nextjsRoutingPage is provided', () => {
      const testPage = '/test-page';

      renderHook(() => useNextjsRoutingPageRegister(testPage));

      expect(mockCookies.set).toHaveBeenCalledWith(
        'nextjsRoutingPage',
        testPage,
        { path: '/', expires: 1 / 24 },
      );
    });

    it('should remove cookie when nextjsRoutingPage is undefined', () => {
      renderHook(() => useNextjsRoutingPageRegister(undefined));

      expect(mockCookies.remove).toHaveBeenCalledWith('nextjsRoutingPage');
    });

    it('should update cookie when nextjsRoutingPage changes', () => {
      const { rerender } = renderHook(
        ({ page }) => useNextjsRoutingPageRegister(page),
        { initialProps: { page: '/initial-page' } },
      );

      expect(mockCookies.set).toHaveBeenCalledWith(
        'nextjsRoutingPage',
        '/initial-page',
        { path: '/', expires: 1 / 24 },
      );

      // Clear mock to check next call
      mockCookies.set.mockClear();

      rerender({ page: '/updated-page' });

      expect(mockCookies.set).toHaveBeenCalledWith(
        'nextjsRoutingPage',
        '/updated-page',
        { path: '/', expires: 1 / 24 },
      );
    });

    it('should call useEffect cleanup when component unmounts', () => {
      const testPage = '/test-page';

      const { unmount } = renderHook(() => useNextjsRoutingPageRegister(testPage));

      expect(mockCookies.set).toHaveBeenCalledWith(
        'nextjsRoutingPage',
        testPage,
        { path: '/', expires: 1 / 24 },
      );

      unmount();

      // useEffect cleanup should not cause additional calls
      expect(mockCookies.set).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid prop changes correctly', () => {
      const { rerender } = renderHook(
        ({ page }: { page: string | undefined }) => useNextjsRoutingPageRegister(page),
        { initialProps: { page: '/page1' as string | undefined } },
      );

      expect(mockCookies.set).toHaveBeenLastCalledWith(
        'nextjsRoutingPage',
        '/page1',
        { path: '/', expires: 1 / 24 },
      );

      rerender({ page: '/page2' });
      expect(mockCookies.set).toHaveBeenLastCalledWith(
        'nextjsRoutingPage',
        '/page2',
        { path: '/', expires: 1 / 24 },
      );

      rerender({ page: undefined });
      expect(mockCookies.remove).toHaveBeenLastCalledWith('nextjsRoutingPage');

      rerender({ page: '/page3' });
      expect(mockCookies.set).toHaveBeenLastCalledWith(
        'nextjsRoutingPage',
        '/page3',
        { path: '/', expires: 1 / 24 },
      );
    });
  });

  describe('detectNextjsRoutingType', () => {
    const createMockContext = (
        hasNextjsHeader: boolean,
        cookieValue?: string,
    ): GetServerSidePropsContext => ({
      req: {
        headers: hasNextjsHeader ? { 'x-nextjs-data': '1' } : {},
        cookies: cookieValue ? { nextjsRoutingPage: cookieValue } : {},
      } as unknown as GetServerSidePropsContext['req'],
      res: {} as unknown as GetServerSidePropsContext['res'],
      query: {},
      params: {},
      resolvedUrl: '/test',
    });

    it('should return INITIAL when request is not CSR (no x-nextjs-data header)', () => {
      const context = createMockContext(false);
      const previousRoutingPage = '/previous-page';

      const result = detectNextjsRoutingType(context, previousRoutingPage);

      expect(result).toBe('initial');
    });

    it('should return SAME_ROUTE when CSR and cookie matches previousRoutingPage', () => {
      const previousRoutingPage = '/same-page';
      const context = createMockContext(true, previousRoutingPage);

      const result = detectNextjsRoutingType(context, previousRoutingPage);

      expect(result).toBe('same-route');
    });

    it('should return FROM_OUTSIDE when CSR but no cookie exists', () => {
      const context = createMockContext(true); // No cookie value
      const previousRoutingPage = '/previous-page';

      const result = detectNextjsRoutingType(context, previousRoutingPage);

      expect(result).toBe('from-outside');
    });

    it('should return FROM_OUTSIDE when CSR and cookie does not match previousRoutingPage', () => {
      const context = createMockContext(true, '/different-page');
      const previousRoutingPage = '/previous-page';

      const result = detectNextjsRoutingType(context, previousRoutingPage);

      expect(result).toBe('from-outside');
    });

    it('should return FROM_OUTSIDE when CSR and cookie is empty string', () => {
      const context = createMockContext(true, '');
      const previousRoutingPage = '/previous-page';

      const result = detectNextjsRoutingType(context, previousRoutingPage);

      expect(result).toBe('from-outside');
    });

    it('should handle x-nextjs-data header with different truthy values', () => {
      const contextWithTruthyHeader: GetServerSidePropsContext = {
        req: {
          headers: { 'x-nextjs-data': 'some-value' },
          cookies: { nextjsRoutingPage: '/test-page' },
        } as unknown as GetServerSidePropsContext['req'],
        res: {} as unknown as GetServerSidePropsContext['res'],
        query: {},
        params: {},
        resolvedUrl: '/test',
      };

      const result = detectNextjsRoutingType(contextWithTruthyHeader, '/test-page');

      expect(result).toBe('same-route');
    });

    it('should handle edge case where cookie value is null but previousRoutingPage exists', () => {
      const context: GetServerSidePropsContext = {
        req: {
          headers: { 'x-nextjs-data': '1' },
          cookies: { nextjsRoutingPage: null as unknown as string }, // Simulating null value
        } as unknown as GetServerSidePropsContext['req'],
        res: {} as unknown as GetServerSidePropsContext['res'],
        query: {},
        params: {},
        resolvedUrl: '/test',
      };

      const result = detectNextjsRoutingType(context, '/previous-page');

      expect(result).toBe('from-outside');
    });

    it('should handle missing x-nextjs-data header even when cookies are present', () => {
      const context: GetServerSidePropsContext = {
        req: {
          headers: {}, // No x-nextjs-data header
          cookies: { nextjsRoutingPage: '/test-page' },
        } as unknown as GetServerSidePropsContext['req'],
        res: {} as unknown as GetServerSidePropsContext['res'],
        query: {},
        params: {},
        resolvedUrl: '/test',
      };

      const result = detectNextjsRoutingType(context, '/test-page');

      expect(result).toBe('initial');
    });

    it('should handle undefined x-nextjs-data header value', () => {
      const context: GetServerSidePropsContext = {
        req: {
          headers: { 'x-nextjs-data': undefined as unknown as string },
          cookies: { nextjsRoutingPage: '/test-page' },
        } as unknown as GetServerSidePropsContext['req'],
        res: {} as unknown as GetServerSidePropsContext['res'],
        query: {},
        params: {},
        resolvedUrl: '/test',
      };

      const result = detectNextjsRoutingType(context, '/test-page');

      expect(result).toBe('initial');
    });
  });
});
