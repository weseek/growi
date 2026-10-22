import { RequestContext } from '@mastra/core/request-context';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';

import { getPageContentTool } from '../../tools/get-page-content-tool';
import { limitedGetPageContentTool } from './limited-get-page-content-tool';
import type {
  PageReadBudget,
  SummarizeRequestContextShape,
} from './request-context';

// Suppress logger noise from the tool under test, mirroring
// limited-search-tool.spec.ts.
vi.mock('~/utils/logger', () => ({
  default: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }),
}));

// get-page-content-tool's module loads Mongoose models at the top level via
// `mongoose.model('Page')`. The delegate's own execute is replaced with a
// spy below, so the model is never actually queried, but the module still
// needs to load safely in the unit environment.
vi.mock('~/server/models/obsolete-page', () => ({
  populateDataToShowRevision: vi.fn(),
}));

const buildRequestContext = (): RequestContext<SummarizeRequestContextShape> =>
  new RequestContext<SummarizeRequestContextShape>();

const buildBudget = (limit: number, used = 0): PageReadBudget => ({
  limit,
  used,
});

type GetPageContentToolResult =
  | {
      result: 'ok';
      page: {
        pageId: string;
        path: string;
        totalLines: number;
        content?: string;
        offset?: number;
        limit?: number;
        hasMore?: boolean;
        outline?: Array<{ line: number; level: number; heading: string }>;
      };
    }
  | {
      result:
        | 'not_found_or_forbidden'
        | 'missing_input'
        | 'context_error'
        | 'limit_exceeded';
      reason: string;
    };

const invokeExecute = async (
  inputData: { pageId?: string; pagePath?: string; offset?: number },
  requestContext: RequestContext<SummarizeRequestContextShape>,
): Promise<GetPageContentToolResult> => {
  // biome-ignore lint/style/noNonNullAssertion: createTool always wires execute
  const result = await limitedGetPageContentTool.execute!(
    inputData as never,
    { requestContext } as never,
  );
  return result as GetPageContentToolResult;
};

const okWithContent = (content: string, hasMore = false) => ({
  result: 'ok' as const,
  page: {
    pageId: 'p1',
    path: '/page1',
    totalLines: 100,
    content,
    offset: 1,
    limit: 200,
    hasMore,
  },
});

const okOutlineOnly = () => ({
  result: 'ok' as const,
  page: {
    pageId: 'p1',
    path: '/page1',
    totalLines: 2000,
    outline: [{ line: 1, level: 1, heading: 'Intro' }],
    // content / offset / hasMore intentionally omitted (outline mode)
  },
});

describe('limitedGetPageContentTool', () => {
  let delegateSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    delegateSpy = vi.spyOn(getPageContentTool, 'execute');
    delegateSpy.mockResolvedValue(okWithContent('line1\nline2\nline3'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('context guard', () => {
    it('returns context_error without delegating when pageReadBudget is missing', async () => {
      const requestContext = buildRequestContext();
      // Intentionally do NOT set 'pageReadBudget'.

      const result = await invokeExecute({ pageId: 'p1' }, requestContext);

      expect(result.result).toBe('context_error');
      expect(delegateSpy).not.toHaveBeenCalled();
    });
  });

  describe('budget boundary', () => {
    it('returns limit_exceeded without delegating when used already equals limit', async () => {
      const requestContext = buildRequestContext();
      const budget = buildBudget(60_000, 60_000);
      requestContext.set('pageReadBudget', budget);

      const result = await invokeExecute({ pageId: 'p1' }, requestContext);

      expect(result.result).toBe('limit_exceeded');
      expect(delegateSpy).not.toHaveBeenCalled();
      expect(budget.used).toBe(60_000);
    });
  });

  describe('charging the budget in characters', () => {
    it('charges the characters of the returned content', async () => {
      const requestContext = buildRequestContext();
      const budget = buildBudget(60_000);
      requestContext.set('pageReadBudget', budget);
      delegateSpy.mockResolvedValue(okWithContent('line1\nline2\nline3', true));

      const result = await invokeExecute(
        { pageId: 'p1', offset: 1 },
        requestContext,
      );

      expect(result).toEqual(okWithContent('line1\nline2\nline3', true));
      expect(budget.used).toBe('line1\nline2\nline3'.length);
    });

    it('charges a single very long line by its length, not as one line', async () => {
      const requestContext = buildRequestContext();
      const budget = buildBudget(60_000);
      requestContext.set('pageReadBudget', budget);
      delegateSpy.mockResolvedValue(okWithContent('x'.repeat(10_000)));

      await invokeExecute({ pageId: 'p1', offset: 1 }, requestContext);

      expect(budget.used).toBe(10_000);
    });

    it('accumulates used across multiple calls', async () => {
      const requestContext = buildRequestContext();
      const budget = buildBudget(60_000);
      requestContext.set('pageReadBudget', budget);
      delegateSpy.mockResolvedValueOnce(okWithContent('abc', true));
      delegateSpy.mockResolvedValueOnce(okWithContent('de', false));

      await invokeExecute({ pageId: 'p1', offset: 1 }, requestContext);
      await invokeExecute({ pageId: 'p1', offset: 4 }, requestContext);

      expect(budget.used).toBe(5);
    });

    it('charges an outline-only response by the outline as sent to the LLM', async () => {
      const requestContext = buildRequestContext();
      const budget = buildBudget(60_000);
      requestContext.set('pageReadBudget', budget);
      delegateSpy.mockResolvedValue(okOutlineOnly());

      const result = await invokeExecute({ pageId: 'p1' }, requestContext);

      expect(result).toEqual(okOutlineOnly());
      expect(budget.used).toBe(
        JSON.stringify(okOutlineOnly().page.outline).length,
      );
    });

    it('stops repeated outline-only calls once the outline has used up the budget', async () => {
      const requestContext = buildRequestContext();
      const outlineChars = JSON.stringify(okOutlineOnly().page.outline).length;
      requestContext.set('pageReadBudget', buildBudget(outlineChars * 2));
      delegateSpy.mockResolvedValue(okOutlineOnly());

      await invokeExecute({ pageId: 'p1' }, requestContext);
      await invokeExecute({ pageId: 'p1' }, requestContext);
      const third = await invokeExecute({ pageId: 'p1' }, requestContext);

      expect(third.result).toBe('limit_exceeded');
      expect(delegateSpy).toHaveBeenCalledTimes(2);
    });

    it('does not charge a failure response', async () => {
      const requestContext = buildRequestContext();
      const budget = buildBudget(60_000);
      requestContext.set('pageReadBudget', budget);
      delegateSpy.mockResolvedValue({
        result: 'not_found_or_forbidden' as const,
        reason: 'page not found or viewer is not permitted',
      });

      const result = await invokeExecute({ pageId: 'p1' }, requestContext);

      expect(result.result).toBe('not_found_or_forbidden');
      expect(budget.used).toBe(0);
    });
  });

  describe('the last read before the limit', () => {
    it('returns only the remaining room, marks more content, and fills the budget exactly', async () => {
      const requestContext = buildRequestContext();
      const budget = buildBudget(100, 90);
      requestContext.set('pageReadBudget', budget);
      delegateSpy.mockResolvedValue(okWithContent('y'.repeat(500), false));

      const result = await invokeExecute(
        { pageId: 'p1', offset: 1 },
        requestContext,
      );

      expect(result).toMatchObject({
        result: 'ok',
        page: { content: 'y'.repeat(10), hasMore: true },
      });
      expect(budget.used).toBe(100);
      const next = await invokeExecute(
        { pageId: 'p1', offset: 2 },
        requestContext,
      );
      expect(next.result).toBe('limit_exceeded');
    });

    it('charges the outline first and cuts the body to what is left after it', async () => {
      const requestContext = buildRequestContext();
      const outline = [{ line: 1, level: 1, heading: 'Intro' }];
      const outlineChars = JSON.stringify(outline).length;
      const budget = buildBudget(outlineChars + 4);
      requestContext.set('pageReadBudget', budget);
      delegateSpy.mockResolvedValue({
        result: 'ok' as const,
        page: { ...okWithContent('abcdefgh').page, outline },
      });

      const result = await invokeExecute({ pageId: 'p1' }, requestContext);

      expect(result).toMatchObject({
        page: { content: 'abcd', hasMore: true, outline },
      });
      expect(budget.used).toBe(outlineChars + 4);
    });
  });

  describe('never modifies getPageContentTool', () => {
    it('forwards the validated input (zod defaults applied) and the same requestContext to the delegate', async () => {
      const requestContext = buildRequestContext();
      requestContext.set('pageReadBudget', buildBudget(1500));

      await invokeExecute({ pageId: 'p1', offset: 5 }, requestContext);

      // The wrapper's input schema is the SAME instance as the original
      // tool's (limit defaults to 200), so the validated payload carries it.
      expect(delegateSpy.mock.calls[0][0]).toEqual({
        pageId: 'p1',
        offset: 5,
        limit: 200,
      });
      expect(delegateSpy.mock.calls[0][1].requestContext).toBe(requestContext);
    });

    it('shares the exact same input schema instance as the wrapped tool', () => {
      expect(limitedGetPageContentTool.inputSchema).toBe(
        getPageContentTool.inputSchema,
      );
    });
  });
});
