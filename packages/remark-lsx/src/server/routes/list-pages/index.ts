
import type { IUser } from '@growi/core';
import { OptionParser } from '@growi/core/dist/plugin';
import { pathUtils, pagePathUtils } from '@growi/core/dist/utils';
import escapeStringRegexp from 'escape-string-regexp';
import type { Request, Response } from 'express';
import createError, { isHttpError } from 'http-errors';

import { addNumCondition } from './add-num-condition';
import { addSortCondition } from './add-sort-condition';
import { generateBaseQuery, type PageQuery } from './generate-base-query';
import { getToppageViewersCount } from './get-toppage-viewers-count';


const DEFAULT_PAGES_NUM = 50;


const { addTrailingSlash } = pathUtils;
const { isTopPage } = pagePathUtils;

function addDepthCondition(query, pagePath, optionsDepth): PageQuery {
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

  if (start < 1 || end < 1) {
    throw createError(400, `specified depth is [${start}:${end}] : start and end are must be larger than 1`);
  }

  // count slash
  const slashNum = isTopPage(pagePath)
    ? 1
    : pagePath.split('/').length;
  const depthStart = slashNum; // start is not affect to fetch page
  const depthEnd = slashNum + end - 1;

  return query.and({
    path: new RegExp(`^(\\/[^\\/]*){${depthStart},${depthEnd}}$`),
  });
}

/**
 * add filter condition that filter fetched pages
 */
function addFilterCondition(query, pagePath, optionsFilter, isExceptFilter = false): PageQuery {
  // when option strings is 'filter=', the option value is true
  if (optionsFilter == null || optionsFilter === true) {
    throw createError(400, 'filter option require value in regular expression.');
  }

  const pagePathForRegexp = escapeStringRegexp(addTrailingSlash(pagePath));

  let filterPath;
  try {
    if (optionsFilter.charAt(0) === '^') {
      // move '^' to the first of path
      filterPath = new RegExp(`^${pagePathForRegexp}${optionsFilter.slice(1, optionsFilter.length)}`);
    }
    else {
      filterPath = new RegExp(`^${pagePathForRegexp}.*${optionsFilter}`);
    }
  }
  catch (err) {
    throw createError(400, err);
  }

  if (isExceptFilter) {
    return query.and({
      path: { $not: filterPath },
    });
  }
  return query.and({
    path: filterPath,
  });
}

function addExceptCondition(query, pagePath, optionsFilter): PageQuery {
  return this.addFilterCondition(query, pagePath, optionsFilter, true);
}


export type ListPagesOptions = {
  depth?: string,
  num?: string,
  filter?: string,
  except?: string,
  sort?: string,
  reverse?: string,
}

export const listPages = async(req: Request & { user: IUser }, res: Response): Promise<Response> => {
  const user = req.user;

  let pagePath: string;
  let options: ListPagesOptions | undefined;

  try {
    // TODO: use express-validator
    if (req.query.pagePath == null) {
      throw new Error("The 'pagePath' query must not be null.");
    }

    pagePath = req.query.pagePath?.toString();
    if (req.query.options != null) {
      options = JSON.parse(req.query.options.toString());
    }
  }
  catch (error) {
    return res.status(400).send(error);
  }

  const builder = await generateBaseQuery(pagePath, user);

  // count viewers of `/`
  let toppageViewersCount;
  try {
    toppageViewersCount = await getToppageViewersCount();
  }
  catch (error) {
    return res.status(500).send(error);
  }

  let query = builder.query;
  try {
    // depth
    if (options?.depth != null) {
      query = addDepthCondition(query, pagePath, options?.depth);
    }
    // filter
    if (options?.filter != null) {
      query = addFilterCondition(query, pagePath, options?.filter);
    }
    if (options?.except != null) {
      query = addExceptCondition(query, pagePath, options?.except);
    }
    // num
    const optionsNum = options?.num || DEFAULT_PAGES_NUM;
    query = addNumCondition(query, optionsNum);
    // sort
    query = addSortCondition(query, options?.sort, options?.reverse);

    const pages = await query.exec();
    return res.status(200).send({ pages, toppageViewersCount });
  }
  catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).send(error);
    }
    return res.status(500).send(error);
  }

};
