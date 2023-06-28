
import { type IUser, OptionParser } from '@growi/core';
import { pathUtils } from '@growi/core/dist/utils';
import escapeStringRegexp from 'escape-string-regexp';
import type { Request, Response } from 'express';
import createError, { isHttpError } from 'http-errors';

import type { LsxApiParams, LsxApiResponseData } from '../../../interfaces/api';

import { addDepthCondition } from './add-depth-condition';
import { addNumCondition } from './add-num-condition';
import { addSortCondition } from './add-sort-condition';
import { generateBaseQuery, type PageQuery } from './generate-base-query';
import { getToppageViewersCount } from './get-toppage-viewers-count';


const { addTrailingSlash, removeTrailingSlash } = pathUtils;

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


export const listPages = async(req: Request & { user: IUser }, res: Response): Promise<Response> => {
  const user = req.user;

  // TODO: use express-validator
  if (req.query.pagePath == null) {
    return res.status(400).send("The 'pagePath' query must not be null.");
  }

  const params: LsxApiParams = {
    pagePath: removeTrailingSlash(req.query.pagePath.toString()),
    offset: req.query?.offset != null ? Number(req.query.offset) : undefined,
    limit: req.query?.limit != null ? Number(req.query?.limit) : undefined,
    options: req.query?.options != null ? JSON.parse(req.query.options.toString()) : {},
  };

  const {
    pagePath, offset, limit, options,
  } = params;
  const builder = await generateBaseQuery(params.pagePath, user);

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
      query = addDepthCondition(query, params.pagePath, OptionParser.parseRange(options.depth));
    }
    // filter
    if (options?.filter != null) {
      query = addFilterCondition(query, pagePath, options.filter);
    }
    if (options?.except != null) {
      query = addExceptCondition(query, pagePath, options.except);
    }

    // get total num before adding num/sort conditions
    const total = await query.clone().count();

    // num
    query = addNumCondition(query, offset, limit);
    // sort
    query = addSortCondition(query, options?.sort, options?.reverse);

    const pages = await query.exec();
    const cursor = (offset ?? 0) + pages.length;

    const responseData: LsxApiResponseData = {
      pages, cursor, total, toppageViewersCount,
    };
    return res.status(200).send(responseData);
  }
  catch (error) {
    if (isHttpError(error)) {
      return res.status(error.status).send(error.message);
    }
    return res.status(500).send(error.message);
  }

};
