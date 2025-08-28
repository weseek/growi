import type { IPage, IUser } from '@growi/core/dist/interfaces';
import { isPermalink as _isPermalink, isCreatablePage, isTopPage } from '@growi/core/dist/utils/page-path-utils';
import { removeHeadingSlash } from '@growi/core/dist/utils/path-utils';
import type { model } from 'mongoose';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { PageModel } from '~/server/models/page';
import type { IPageRedirect, PageRedirectModel } from '~/server/models/page-redirect';

import type { InitialProps, SameRouteEachProps } from '../general-page';

// Utility to resolve path, redirect, and identical path page check
type PathResolutionResult = {
  resolvedPathname: string;
  isIdenticalPathPage: boolean;
  redirectFrom?: string;
};

let mongooseModel: typeof model;
let Page: PageModel;
let PageRedirect: PageRedirectModel;

async function resolvePathAndCheckIdentical(
    path: string,
    user: IUser | undefined,
): Promise<PathResolutionResult> {
  if (mongooseModel == null) {
    mongooseModel = (await import('mongoose')).model;
  }
  if (Page == null) {
    Page = mongooseModel<IPage, PageModel>('Page');
  }
  if (PageRedirect == null) {
    PageRedirect = mongooseModel<IPageRedirect, PageRedirectModel>('PageRedirect');
  }

  const isPermalink = _isPermalink(path);
  let resolvedPathname = path;
  let redirectFrom: string | undefined;
  let isIdenticalPathPage = false;

  if (!isPermalink) {
    const chains = await PageRedirect.retrievePageRedirectEndpoints(path);
    if (chains != null) {
      resolvedPathname = chains.end.toPath;
      redirectFrom = chains.start.fromPath;
    }
    const multiplePagesCount = await Page.countByPathAndViewer(resolvedPathname, user, null, true);
    isIdenticalPathPage = multiplePagesCount > 1;
  }
  return { resolvedPathname, isIdenticalPathPage, redirectFrom };
}

// Page data retrieval for initial load - returns GetServerSidePropsResult
export async function getPageDataForInitial(
    context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<
  Pick<InitialProps, 'pageWithMeta' | 'isNotFound' | 'isNotCreatable' | 'isForbidden' | 'skipSSR'> &
  Pick<SameRouteEachProps, 'currentPathname' | 'isIdenticalPathPage'>
>> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi, user } = req;
  const { revisionId } = req.query;

  // Parse path from URL
  let { path: pathFromQuery } = context.query;
  pathFromQuery = pathFromQuery != null ? pathFromQuery as string[] : [];
  let pathFromUrl = `/${pathFromQuery.join('/')}`;
  pathFromUrl = pathFromUrl === '//' ? '/' : pathFromUrl;

  const { pageService, configManager } = crowi;

  const pageId = _isPermalink(pathFromUrl) ? removeHeadingSlash(pathFromUrl) : null;
  const isPermalink = _isPermalink(pathFromUrl);

  const { resolvedPathname, isIdenticalPathPage } = await resolvePathAndCheckIdentical(pathFromUrl, user);

  if (isIdenticalPathPage) {
    return {
      props: {
        currentPathname: resolvedPathname,
        isIdenticalPathPage: true,
        pageWithMeta: null,
        isNotFound: false,
        isNotCreatable: true,
        isForbidden: false,
        skipSSR: false,
      },
    };
  }

  // Get full page data
  const pageWithMeta = await pageService.findPageAndMetaDataByViewer(pageId, resolvedPathname, user, true);
  const { data: page, meta } = pageWithMeta ?? {};

  // Add user to seen users
  if (page != null && user != null) {
    await page.seen(user);
  }

  if (page != null) {
    // Handle existing page
    page.initLatestRevisionField(revisionId);
    const ssrMaxRevisionBodyLength = configManager.getConfig('app:ssrMaxRevisionBodyLength');

    // Check if SSR should be skipped
    const latestRevisionBodyLength = await page.getLatestRevisionBodyLength();
    const skipSSR = latestRevisionBodyLength != null && ssrMaxRevisionBodyLength < latestRevisionBodyLength;

    const populatedPage = await page.populateDataToShowRevision(skipSSR);

    // Handle URL conversion
    let finalPathname = resolvedPathname;
    if (page != null && !page.isEmpty) {
      if (isPermalink) {
        finalPathname = page.path;
      }
      else {
        const isToppage = isTopPage(resolvedPathname);
        if (!isToppage) {
          finalPathname = `/${page._id}`;
        }
      }
    }

    return {
      props: {
        currentPathname: finalPathname,
        isIdenticalPathPage: false,
        pageWithMeta: { data: populatedPage, meta },
        isNotFound: page.isEmpty,
        isNotCreatable: false,
        isForbidden: false,
        skipSSR,
      },
    };
  }

  // Handle non-existent page
  const count = isPermalink
    ? await Page.count({ _id: pageId })
    : await Page.count({ path: resolvedPathname });

  return {
    props: {
      currentPathname: resolvedPathname,
      isIdenticalPathPage: false,
      pageWithMeta: null,
      isNotFound: true,
      isNotCreatable: !isCreatablePage(resolvedPathname),
      isForbidden: count > 0,
      skipSSR: false,
    },
  };
}

// Page data retrieval for same-route navigation
export async function getPageDataForSameRoute(
    context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Pick<SameRouteEachProps, 'currentPathname' | 'isIdenticalPathPage' | 'redirectFrom'>>> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { user } = req;

  const currentPathname = decodeURIComponent(context.resolvedUrl?.split('?')[0] ?? '/');
  const pageId = _isPermalink(currentPathname) ? removeHeadingSlash(currentPathname) : null;
  const isPermalink = _isPermalink(currentPathname);

  const { resolvedPathname, isIdenticalPathPage, redirectFrom } = await resolvePathAndCheckIdentical(currentPathname, user);

  if (isIdenticalPathPage) {
    return {
      props: {
        currentPathname: resolvedPathname,
        isIdenticalPathPage: true,
        redirectFrom,
      },
    };
  }

  // For same route access, do minimal page lookup
  const basicPageInfo = await Page.findOne(
    isPermalink ? { _id: pageId } : { path: resolvedPathname },
  ).exec();

  let finalPathname = resolvedPathname;
  if (basicPageInfo != null && !basicPageInfo.isEmpty) {
    if (isPermalink) {
      finalPathname = basicPageInfo.path;
    }
    else {
      const isToppage = isTopPage(resolvedPathname);
      if (!isToppage) {
        finalPathname = `/${basicPageInfo._id}`;
      }
    }
  }

  return {
    props: {
      currentPathname: finalPathname,
      isIdenticalPathPage: false,
      redirectFrom,
    },
  };
}
