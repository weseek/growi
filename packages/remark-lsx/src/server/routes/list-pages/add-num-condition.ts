import type { IPage } from '@growi/core';
import { OptionParser } from '@growi/core/dist/plugin';
import createError from 'http-errors';
import type { Query, Document } from 'mongoose';


/**
 * add num condition that limit fetched pages
 */
export const addNumCondition = (query: Query<IPage[], Document>, optionsNum: true | string | number | null): Query<IPage[], Document> => {
  // when option strings is 'num=' or the option value is true
  if (optionsNum == null || optionsNum === true) {
    throw createError(400, 'The value of num option is invalid.');
  }

  if (typeof optionsNum === 'number') {
    return query.limit(optionsNum);
  }

  const range = OptionParser.parseRange(optionsNum);

  if (range == null) {
    return query;
  }

  const start = range.start;
  const end = range.end;

  if (start < 1 || end < 1) {
    throw createError(400, `specified num is [${start}:${end}] : start and end are must be larger than 1`);
  }

  const skip = start - 1;
  const limit = end - skip;

  return query.skip(skip).limit(limit);
};
