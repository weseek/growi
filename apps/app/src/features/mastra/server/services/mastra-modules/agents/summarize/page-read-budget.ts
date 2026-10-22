import type { PageReadBudget } from './request-context';

type PageSlice = {
  readonly content?: string;
  readonly hasMore?: boolean;
  readonly outline?: readonly unknown[];
};

export const isPageReadBudgetExhausted = (budget: PageReadBudget): boolean =>
  budget.used >= budget.limit;

/**
 * Charges one tool result against the remaining budget, in characters: the
 * outline as the LLM receives it (serialised), then the body. A body that
 * does not fit is cut at the remaining room and reported as `hasMore`.
 */
export const fitPageToBudget = <T extends PageSlice>(
  page: T,
  remaining: number,
): { page: T; consumed: number } => {
  const outlineChars =
    page.outline == null ? 0 : JSON.stringify(page.outline).length;
  if (page.content == null) {
    return { page, consumed: outlineChars };
  }

  const contentRoom = Math.max(0, remaining - outlineChars);
  if (page.content.length <= contentRoom) {
    return { page, consumed: outlineChars + page.content.length };
  }
  return {
    page: {
      ...page,
      content: page.content.slice(0, contentRoom),
      hasMore: true,
    },
    consumed: outlineChars + contentRoom,
  };
};
