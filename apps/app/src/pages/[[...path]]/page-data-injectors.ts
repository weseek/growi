import { pagePathUtils, pathUtils } from '@growi/core/dist/utils';
import type { GetServerSidePropsContext } from 'next';

import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { PageModel, PageDocument } from '~/server/models/page';
import type { PageRedirectModel } from '~/server/models/page-redirect';

import type { ExtendedInitialProps, SameRouteEachProps } from './types';

const { isPermalink: _isPermalink, isCreatablePage } = pagePathUtils;
const { removeHeadingSlash } = pathUtils;

// Private helper function to check if SSR should be skipped
async function skipSSR(page: PageDocument, ssrMaxRevisionBodyLength: number): Promise<boolean> {
  const latestRevisionBodyLength = await page.getLatestRevisionBodyLength();
  if (latestRevisionBodyLength == null) return true;
  return ssrMaxRevisionBodyLength < latestRevisionBodyLength;
}

function getPageIdFromPathname(currentPathname: string): string | null {
  return _isPermalink(currentPathname) ? removeHeadingSlash(currentPathname) : null;
}

// Common URL conversion helper
function handleUrlConversion(
    page: PageDocument | null,
    currentPathname: string,
    isPermalink: boolean,
): string {
  if (page != null && !page.isEmpty) {
    if (isPermalink) {
      return page.path;
    }

    const isToppage = pagePathUtils.isTopPage(currentPathname);
    if (!isToppage) {
      return `/${page._id}`;
    }
  }
  return currentPathname;
}

// Helper function to inject page data for initial access
export async function injectPageDataForInitial(context: GetServerSidePropsContext, props: ExtendedInitialProps): Promise<void> {
  const { model: mongooseModel } = await import('mongoose');
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

  const pageId = getPageIdFromPathname(pathFromUrl);
  const isPermalink = _isPermalink(pathFromUrl);

  // Simple path handling with correct redirect method
  let currentPathname = pathFromUrl;

  // Check for redirects using the correct method from the original code
  if (!isPermalink) {
    const chains = await PageRedirect.retrievePageRedirectEndpoints(pathFromUrl);
    if (chains != null) {
      // overwrite currentPathname
      currentPathname = chains.end.toPath;
      props.redirectFrom = chains.start.fromPath;
    }
  }

  props.currentPathname = currentPathname;

  // Check multiple pages hits - handled directly for consistency with other page states
  const multiplePagesCount = await Page.countByPathAndViewer(currentPathname, user, null, true);
  props.isIdenticalPathPage = multiplePagesCount > 1;

  // Early return for identical path pages - efficiency optimization from original code
  if (props.isIdenticalPathPage) {
    props.pageWithMeta = null;
    props.isNotFound = false;
    props.isNotCreatable = true; // Cannot create when multiple pages exist with same path
    props.isForbidden = false;
    return; // Skip expensive operations
  }

  // Get full page data for SSR (only when not identical path)
  const pageWithMeta = await pageService.findPageAndMetaDataByViewer(pageId, currentPathname, user, true);
  const { data: page, meta } = pageWithMeta ?? {};

  // Add user to seen users
  if (page != null && user != null) {
    await page.seen(user);
  }

  props.pageWithMeta = null;

  if (page != null) {
    // Handle existing page
    page.initLatestRevisionField(revisionId);
    const ssrMaxRevisionBodyLength = configManager.getConfig('app:ssrMaxRevisionBodyLength');
    props.skipSSR = await skipSSR(page, ssrMaxRevisionBodyLength);
    const populatedPage = await page.populateDataToShowRevision(props.skipSSR);

    props.pageWithMeta = { data: populatedPage, meta };
    props.isNotFound = page.isEmpty;
    props.isNotCreatable = false;
    props.isForbidden = false;

    // Handle URL conversion
    props.currentPathname = handleUrlConversion(page, currentPathname, isPermalink);
  }
  else {
    // Handle non-existent page
    props.pageWithMeta = null;
    props.isNotFound = true;
    props.isNotCreatable = !isCreatablePage(currentPathname);

    // Check if forbidden or just doesn't exist
    const count = isPermalink
      ? await Page.count({ _id: pageId })
      : await Page.count({ path: currentPathname });
    props.isForbidden = count > 0;
  }
}

// For same route access: Minimal data injection (client will fetch page data)
export async function injectSameRoutePageData(context: GetServerSidePropsContext, props: SameRouteEachProps): Promise<void> {
  const { model: mongooseModel } = await import('mongoose');
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi, user } = req;

  const Page = crowi.model('Page') as PageModel;
  const PageRedirect = mongooseModel('PageRedirect') as PageRedirectModel;

  const currentPathname = props.currentPathname;
  const pageId = getPageIdFromPathname(currentPathname);
  const isPermalink = _isPermalink(currentPathname);

  // Handle redirects using the correct method from original code
  let resolvedPathname = currentPathname;

  if (!isPermalink) {
    const chains = await PageRedirect.retrievePageRedirectEndpoints(currentPathname);
    if (chains != null) {
      // overwrite resolvedPathname
      resolvedPathname = chains.end.toPath;
      props.redirectFrom = chains.start.fromPath;
    }
  }

  props.currentPathname = resolvedPathname;

  // Check multiple pages hits - handled directly for consistency
  const multiplePagesCount = await Page.countByPathAndViewer(resolvedPathname, user, null, true);
  props.isIdenticalPathPage = multiplePagesCount > 1;

  // Early return for identical path pages - efficiency optimization
  if (props.isIdenticalPathPage) {
    return; // Skip expensive page lookup operations
  }

  // For same route access, we only do minimal checks
  // The client will use fetchCurrentPage to get the actual page data
  const basicPageInfo = await Page.findOne(
    isPermalink ? { _id: pageId } : { path: resolvedPathname },
  ).exec();

  if (basicPageInfo != null) {
    // Handle URL conversion using shared helper
    props.currentPathname = handleUrlConversion(basicPageInfo, resolvedPathname, isPermalink);
  }

  // For same route, routing state properties (isNotFound, isForbidden, isNotCreatable)
  // are handled client-side via fetchCurrentPage in useFetchCurrentPage hook.
  // The fetchCurrentPage function will set appropriate routing state atoms based on API response:
  // - pageNotFoundAtom: set to true when page doesn't exist (404)
  // - pageNotCreatableAtom: determined by path analysis for 404s, or set to true for 403s
  // This approach provides better performance for same-route navigation while maintaining
  // the same routing behavior as initial page loads.
}
