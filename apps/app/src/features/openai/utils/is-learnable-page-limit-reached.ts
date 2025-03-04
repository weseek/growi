import { LIMIT_LEARNABLE_PAGE_COUNT } from '../interfaces/ai-assistant';

export const isLearnablePageLimitReached = (totalPageCount: number): boolean => {
  return totalPageCount > LIMIT_LEARNABLE_PAGE_COUNT;
};
