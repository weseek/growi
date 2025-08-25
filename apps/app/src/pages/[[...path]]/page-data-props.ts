import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { PageModel } from '~/server/models/page';
import type { PageRedirectModel } from '~/server/models/page-redirect';

import type { InitialProps, SameRouteEachProps } from './types';

// Page data retrieval for initial load - returns GetServerSidePropsResult
export async function getPageDataForInitial(
    context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<
    Pick<InitialProps, 'pageWithMeta' | 'isNotFound' | 'isNotCreatable' | 'isForbidden' | 'skipSSR'> &
    Pick<SameRouteEachProps, 'currentPathname' | 'isIdenticalPathPage'>
  >> {
  const { pagePathUtils, pathUtils } = await import('@growi/core/dist/utils');
  const { model: mongooseModel } = await import('mongoose');

  const { isPermalink: _isPermalink, isCreatablePage } = pagePathUtils;
  const { removeHeadingSlash } = pathUtils;

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi, user } = req;
  const { revisionId } = req.query;

  // Parse path from URL
  let { path: pathFromQuery } = context.query;
  pathFromQuery = pathFromQuery != null ? pathFromQuery as string[] : [];
  let pathFromUrl = `/${pathFromQuery.join('/')}`;
  pathFromUrl = pathFromUrl === '//' ? '/' : pathFromUrl;

  const Page = crowi.model('Page') as PageModel;
  const PageRedirect = mongooseModel('PageRedirect') as PageRedirectModel;
  const { pageService, configManager } = crowi;

  const pageId = _isPermalink(pathFromUrl) ? removeHeadingSlash(pathFromUrl) : null;
  const isPermalink = _isPermalink(pathFromUrl);

  let currentPathname = pathFromUrl;

  // Check for redirects
  if (!isPermalink) {
    const chains = await PageRedirect.retrievePageRedirectEndpoints(pathFromUrl);
    if (chains != null) {
      currentPathname = chains.end.toPath;
    }
  }

  // Check multiple pages hits
  const multiplePagesCount = await Page.countByPathAndViewer(currentPathname, user, null, true);
  const isIdenticalPathPage = multiplePagesCount > 1;

  // Early return for identical path pages
  if (isIdenticalPathPage) {
    return {
      props: {
        currentPathname,
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
  const pageWithMeta = await pageService.findPageAndMetaDataByViewer(pageId, currentPathname, user, true);
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
    let finalPathname = currentPathname;
    if (page != null && !page.isEmpty) {
      if (isPermalink) {
        finalPathname = page.path;
      }
      else {
        const isToppage = pagePathUtils.isTopPage(currentPathname);
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
    : await Page.count({ path: currentPathname });

  return {
    props: {
      currentPathname,
      isIdenticalPathPage: false,
      pageWithMeta: null,
      isNotFound: true,
      isNotCreatable: !isCreatablePage(currentPathname),
      isForbidden: count > 0,
      skipSSR: false,
    },
  };
}

// Page data retrieval for same-route navigation
export async function getPageDataForSameRoute(
    context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<Pick<SameRouteEachProps, 'currentPathname' | 'isIdenticalPathPage' | 'redirectFrom'>>> {
  const { pagePathUtils, pathUtils } = await import('@growi/core/dist/utils');
  const { model: mongooseModel } = await import('mongoose');

  const { isPermalink: _isPermalink } = pagePathUtils;
  const { removeHeadingSlash } = pathUtils;

  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi, user } = req;

  const Page = crowi.model('Page') as PageModel;
  const PageRedirect = mongooseModel('PageRedirect') as PageRedirectModel;

  const currentPathname = decodeURIComponent(context.resolvedUrl?.split('?')[0] ?? '/');
  const pageId = _isPermalink(currentPathname) ? removeHeadingSlash(currentPathname) : null;
  const isPermalink = _isPermalink(currentPathname);

  // Handle redirects
  let resolvedPathname = currentPathname;
  let redirectFrom: string | undefined;

  if (!isPermalink) {
    const chains = await PageRedirect.retrievePageRedirectEndpoints(currentPathname);
    if (chains != null) {
      resolvedPathname = chains.end.toPath;
      redirectFrom = chains.start.fromPath;
    }
  }

  // Check multiple pages hits
  const multiplePagesCount = await Page.countByPathAndViewer(resolvedPathname, user, null, true);
  const isIdenticalPathPage = multiplePagesCount > 1;

  // Early return for identical path pages
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
      const isToppage = pagePathUtils.isTopPage(resolvedPathname);
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
