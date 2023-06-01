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

  // check start
  if (start < 1) {
    throw createError(400, `specified num is [${start}:${end}] : the start must be larger or equal than 1`);
  }

  const skip = start - 1;
  const limit = end - skip;

  if (limit < 0) {
    return query.skip(skip);
  }

  return query.skip(skip).limit(limit);
};
