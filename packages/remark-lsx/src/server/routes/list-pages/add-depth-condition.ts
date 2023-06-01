import { OptionParser } from '@growi/core/dist/plugin';
import { pagePathUtils } from '@growi/core/dist/utils';
import createError from 'http-errors';

import type { PageQuery } from './generate-base-query';

const { isTopPage } = pagePathUtils;

export const addDepthCondition = (query: PageQuery, pagePath: string, optionsDepth: true | string | null): PageQuery => {
  // when option strings is 'depth=', the option value is true
  if (optionsDepth == null || optionsDepth === true) {
    throw createError(400, 'The value of depth option is invalid.');
  }

  const range = OptionParser.parseRange(optionsDepth);

  if (range == null) {
    return query;
  }

  const start = range.start;
  const end = range.end;

  // check start
  if (start < 1) {
    throw createError(400, `specified depth is [${start}:${end}] : the start must be larger or equal than 1`);
  }

  // count slash
  const slashNum = isTopPage(pagePath)
    ? 1
    : pagePath.split('/').length;
  const depthStart = slashNum + start - 1;
  const depthEnd = slashNum + end - 1;

  if (end < 0) {
    return query.and([
      { path: new RegExp(`^(\\/[^\\/]*){${depthStart},}$`) },
    ]);
  }

  return query.and([
    { path: new RegExp(`^(\\/[^\\/]*){${depthStart},${depthEnd}}$`) },
  ]);
};
