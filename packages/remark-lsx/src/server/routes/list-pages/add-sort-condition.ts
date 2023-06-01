import type { IPage } from '@growi/core';
import createError from 'http-errors';
import type { Query, Document } from 'mongoose';

/**
 * add sort condition(sort key & sort order)
 *
 * If only the reverse option is specified, the sort key is 'path'.
 * If only the sort key is specified, the sort order is the ascending order.
 *
 */
export const addSortCondition = (query: Query<IPage[], Document>, optionsSortArg?: string, optionsReverse?: string): Query<IPage[], Document> => {
  // init sort key
  const optionsSort = optionsSortArg ?? 'path';

  // the default sort order
  const isReversed = optionsReverse === 'true';

  if (optionsSort !== 'path' && optionsSort !== 'createdAt' && optionsSort !== 'updatedAt') {
    throw createError(400, `The specified value '${optionsSort}' for the sort option is invalid. It must be 'path', 'createdAt' or 'updatedAt'.`);
  }

  const sortOption = {};
  sortOption[optionsSort] = isReversed ? -1 : 1;
  return query.sort(sortOption);
};
