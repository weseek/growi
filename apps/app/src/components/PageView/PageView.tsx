import {
  type JSX,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from 'react';
import dynamic from 'next/dynamic';
import { isDeepEquals } from '@growi/core/dist/utils/is-deep-equals';
import { isUsersHomepage } from '@growi/core/dist/utils/page-path-utils';
import { useSlidesByFrontmatter } from '@growi/presentation/dist/services';
import { useTranslation } from 'react-i18next';

// biome-ignore lint/style/noRestrictedImports: the existing notification UI, used from this client-only component
import { toastError } from '~/client/util/toastr';
import { PagePathNavTitle } from '~/components/Common/PagePathNavTitle';
// biome-ignore lint/style/noRestrictedImports: client-only hook used in client-only component (must run unconditionally, so it cannot go through next/dynamic like the components below)
import { useAnchorResolver } from '~/features/inline-comment/client/components/AnchorResolver/use-anchor-resolver';
// biome-ignore lint/style/noRestrictedImports: client-only service used in client-only component
import { rangesById } from '~/features/inline-comment/client/services/resolved-range';
// biome-ignore lint/style/noRestrictedImports: client-only hook used in client-only component (must run unconditionally, so it cannot go through next/dynamic like the components below)
import { useSWRxInlineComments } from '~/features/inline-comment/client/stores/inline-comment';
import type { RendererConfig } from '~/interfaces/services/renderer';
import { useShouldExpandContent } from '~/services/layout/use-should-expand-content';
import {
  useCurrentPageData,
  useCurrentPageId,
  useIsForbidden,
  useIsIdenticalPath,
  useIsNotCreatable,
  usePageNotFound,
  useShareLinkId,
} from '~/states/page';
import { useViewOptions } from '~/stores/renderer';

import { UserInfo } from '../User/UserInfo';
import { PageAlerts } from './PageAlerts/PageAlerts';
import { PageContentFooter } from './PageContentFooter';
import { PageViewLayout } from './PageViewLayout';
import { useHashAutoScroll } from './use-hash-auto-scroll';

// biome-ignore-start lint/style/noRestrictedImports: no-problem dynamic import
const NotCreatablePage = dynamic(
  () =>
    import('~/client/components/NotCreatablePage').then(
      (mod) => mod.NotCreatablePage,
    ),
  { ssr: false },
);
const ForbiddenPage = dynamic(
  () => import('~/client/components/ForbiddenPage'),
  { ssr: false },
);
const NotFoundPage = dynamic(() => import('~/client/components/NotFoundPage'), {
  ssr: false,
});
const PageSideContents = dynamic(
  () =>
    import('~/client/components/PageSideContents').then(
      (mod) => mod.PageSideContents,
    ),
  { ssr: false },
);
const PageContentsUtilities = dynamic(
  () =>
    import('~/client/components/Page/PageContentsUtilities').then(
      (mod) => mod.PageContentsUtilities,
    ),
  { ssr: false },
);
const Comments = dynamic(
  () => import('~/client/components/Comments').then((mod) => mod.Comments),
  { ssr: false },
);
const SelectionCapture = dynamic(
  () =>
    import(
      '~/features/inline-comment/client/components/SelectionCapture/SelectionCapture'
    ).then((mod) => mod.SelectionCapture),
  { ssr: false },
);
const InlineCommentHighlight = dynamic(
  () =>
    import(
      '~/features/inline-comment/client/components/InlineCommentHighlight/InlineCommentHighlight'
    ).then((mod) => mod.InlineCommentHighlight),
  { ssr: false },
);
const InlineCommentBodyInteraction = dynamic(
  () =>
    import(
      '~/features/inline-comment/client/components/InlineCommentBodyInteraction/InlineCommentBodyInteraction'
    ).then((mod) => mod.InlineCommentBodyInteraction),
  { ssr: false },
);
const UsersHomepageFooter = dynamic(
  () =>
    import('~/client/components/UsersHomepageFooter').then(
      (mod) => mod.UsersHomepageFooter,
    ),
  { ssr: false },
);
const IdenticalPathPage = dynamic(
  () =>
    import('~/client/components/IdenticalPathPage').then(
      (mod) => mod.IdenticalPathPage,
    ),
  { ssr: false },
);
const SlideRenderer = dynamic(
  () =>
    import('~/client/components/Page/SlideRenderer').then(
      (mod) => mod.SlideRenderer,
    ),
  { ssr: false },
);
const PageContentRenderer = dynamic(
  () => import('./PageContentRenderer').then((mod) => mod.PageContentRenderer),
  { ssr: true },
);
// biome-ignore-end lint/style/noRestrictedImports: no-problem dynamic import

type Props = {
  pagePath: string;
  rendererConfig: RendererConfig;
  className?: string;
};

/**
 * A THIRD `CSS.highlights` name, alongside `growi-inline-comment` (saved
 * anchors, drawn by InlineCommentHighlight) and
 * `growi-inline-comment-pending` (the in-creation selection). Registered for a
 * moment right after scrolling so the reader can see WHICH range the comment
 * list just took them to (Requirement 3.3). The same `Range` may be
 * registered under several names at once; the later-registered name paints on
 * top, so this wins over the saved highlight while it lasts.
 */
const EMPHASIS_HIGHLIGHT_NAME = 'growi-inline-comment-emphasis';

/**
 * Long enough for the smooth scroll to finish and for the eye to land on the
 * range, short enough that it reads as a flash rather than a fourth
 * persistent highlight state.
 */
const EMPHASIS_DURATION_MS = 2000;

/**
 * Mirrors InlineCommentHighlight's own capability probe (that copy is
 * unexported and its file is outside this task's boundary). Browsers without
 * the CSS Custom Highlight API still scroll — they just get no emphasis.
 */
const supportsCustomHighlightApi = (): boolean =>
  typeof CSS !== 'undefined' &&
  CSS.highlights != null &&
  typeof Highlight !== 'undefined';

/**
 * `Range` has no `scrollIntoView()`, so scrolling goes through the nearest
 * enclosing element. `startContainer` is a `Text` node for any range built
 * from rendered markdown text.
 */
const scrollTargetOf = (range: Range): Element | null =>
  range.startContainer instanceof Element
    ? range.startContainer
    : range.startContainer.parentElement;

// Custom comparison function for memo to prevent unnecessary re-renders
const arePropsEqual = (prevProps: Props, nextProps: Props): boolean =>
  prevProps.pagePath === nextProps.pagePath &&
  prevProps.className === nextProps.className &&
  isDeepEquals(prevProps.rendererConfig, nextProps.rendererConfig);

const PageViewComponent = (props: Props): JSX.Element => {
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  // Wraps whichever of PageContentRenderer/SlideRenderer is rendered below,
  // giving SelectionCapture/AnchorResolver/InlineCommentHighlight a container
  // scoped to the page body only (excludes the sidebar and the comment
  // threads). RevisionRenderer.tsx already forwards a ref to its own
  // ReactMarkdown-wrapping div (task 5.1); this outer div reads the same
  // rendered text since it contains nothing else, without requiring
  // PageContentRenderer.tsx (a thin dynamic-import wrapper) to also forward
  // a ref through next/dynamic.
  const pageBodyContainerRef = useRef<HTMLDivElement>(null);

  const { pagePath, rendererConfig, className } = props;

  const { t } = useTranslation();

  const currentPageId = useCurrentPageId();
  const isIdenticalPathPage = useIsIdenticalPath();
  const isForbidden = useIsForbidden();
  const isNotCreatable = useIsNotCreatable();
  const isNotFoundMeta = usePageNotFound();

  const contentContainerId = useId();

  const page = useCurrentPageData();
  const { data: viewOptions } = useViewOptions();

  const isNotFound = isNotFoundMeta || page == null;
  const isUsersHomepagePath = isUsersHomepage(pagePath);

  const shouldExpandContent = useShouldExpandContent(page);

  const markdown = page?.revision?.body;
  const isSlide = useSlidesByFrontmatter(
    markdown,
    rendererConfig.isEnabledMarp,
  );

  // Auto-scroll to URL hash target, handling lazy-rendered content
  useHashAutoScroll({ key: currentPageId, contentContainerId });

  // Inline comments (Requirements 1.1, 2.1, 2.5, 6.2). PageView.tsx is only
  // ever rendered by the normal page route (`pages/[[...path]]`) — the
  // share-link route renders the separate `ShareLinkPageView` component
  // instead, which this task does not touch, and only THAT route's
  // `useHydratePageAtoms(..., { shareLinkId })` call ever sets
  // `shareLinkIdAtom` (see `pages/share/[[...path]]/index.page.tsx` vs.
  // `pages/[[...path]]/index.page.tsx`). So `useShareLinkId()` is always
  // `undefined` on every route that actually renders this component today.
  // The check below is still added as explicit defense-in-depth (mirrors
  // the client-side `isSharedPage`-style guard other share-link-sensitive UI
  // in this codebase uses) so that if PageView.tsx is ever reused under a
  // share-link context in the future, the inline-comment UI — and the
  // network request below — stay off by construction rather than by the
  // routes happening to stay separate.
  const shareLinkId = useShareLinkId();
  const isSharedPageView = shareLinkId != null;
  const {
    data: inlineComments,
    resolve: resolveInlineComment,
    createReply: createInlineCommentReply,
  } = useSWRxInlineComments(isSharedPageView ? null : (page?._id ?? null));
  const inlineCommentAnchors = useMemo(
    () =>
      (inlineComments ?? []).map((comment) => ({
        id: comment.id,
        anchor: comment.anchor,
      })),
    [inlineComments],
  );
  const resolvedInlineCommentRanges = useAnchorResolver(
    pageBodyContainerRef,
    inlineCommentAnchors,
  );
  // Comments'/PageComment's (and InlineCommentBodyInteraction's)
  // inlineComments.createReply prop takes the reply text directly; the
  // store's createReply takes the POST body ({ comment }). Adapt the shape
  // once here, shared by both consumers below, rather than duplicating the
  // same one-line adapter (and risking the two drifting if the DTO shape
  // ever changes).
  const createInlineCommentReplyText = useCallback(
    (parentId: string, comment: string) =>
      createInlineCommentReply(parentId, { comment }),
    [createInlineCommentReply],
  );
  // Bundled with resolve/createReply from the SAME useSWRxInlineComments()
  // call as the data (design.md 決定3 / tasks.md 6.1's Implementation Notes)
  // -- InlineCommentItem needs those callbacks bound to this exact fetch, so
  // that no second fetch site is introduced (Requirement 13.8: the
  // share-link view must never fetch inline comments at all). Omitted
  // entirely (not an empty bundle) while data hasn't arrived yet or the
  // fetch is disabled, matching Comments'/PageComment's own "omit when
  // absent" default.

  // Scroll navigation from the page-footer comment list to the highlighted
  // range in the page body (Requirements 3.1, 3.2, 3.3 / design.md 決定4).
  // PageView already owns both inputs -- the container ref and the resolver's
  // output -- so the capability is implemented here and handed to the list as
  // a callback rather than re-deriving either of them downstream.
  const emphasisTimeoutRef = useRef<number | undefined>(undefined);
  const clearEmphasis = useCallback(() => {
    if (emphasisTimeoutRef.current != null) {
      window.clearTimeout(emphasisTimeoutRef.current);
      emphasisTimeoutRef.current = undefined;
    }
    if (supportsCustomHighlightApi()) {
      CSS.highlights.delete(EMPHASIS_HIGHLIGHT_NAME);
    }
  }, []);
  // A pending emphasis outlives this component without this: the timeout
  // would fire (or never fire) with the highlight still registered globally.
  useEffect(() => clearEmphasis, [clearEmphasis]);

  const scrollToRange = useCallback(
    (commentId: string): boolean => {
      const container = pageBodyContainerRef.current;
      const range =
        container == null
          ? undefined
          : rangesById(container, resolvedInlineCommentRanges).get(commentId);
      if (range == null) {
        // Requirement 3.2: the anchor no longer resolves to anywhere in the
        // current body, so there is nothing to scroll to -- say so instead of
        // failing silently.
        toastError(t('inline_comment.range_not_found'));
        return false;
      }

      scrollTargetOf(range)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Requirement 3.3
      clearEmphasis();
      if (supportsCustomHighlightApi()) {
        CSS.highlights.set(EMPHASIS_HIGHLIGHT_NAME, new Highlight(range));
        emphasisTimeoutRef.current = window.setTimeout(
          clearEmphasis,
          EMPHASIS_DURATION_MS,
        );
      }

      return true;
    },
    [resolvedInlineCommentRanges, clearEmphasis, t],
  );

  const inlineCommentsForComments = useMemo(
    () =>
      inlineComments == null
        ? undefined
        : {
            comments: inlineComments,
            resolve: resolveInlineComment,
            createReply: createInlineCommentReplyText,
            scrollToRange,
          },
    [
      inlineComments,
      resolveInlineComment,
      createInlineCommentReplyText,
      scrollToRange,
    ],
  );

  const specialContents = useMemo(() => {
    if (isIdenticalPathPage) {
      return <IdenticalPathPage />;
    }
    if (isForbidden) {
      return <ForbiddenPage />;
    }
    if (isNotCreatable) {
      return <NotCreatablePage />;
    }
  }, [isForbidden, isIdenticalPathPage, isNotCreatable]);

  const headerContents = (
    <PagePathNavTitle
      pageId={page?._id}
      pagePath={pagePath}
      isWipPage={page?.wip}
    />
  );

  const sideContents =
    !isNotFound && !isNotCreatable ? <PageSideContents page={page} /> : null;

  const footerContents =
    !isIdenticalPathPage && !isNotFound ? (
      <>
        {isUsersHomepagePath && page.creator != null && (
          <UsersHomepageFooter creatorId={page.creator._id} />
        )}
        <PageContentFooter page={page} />
      </>
    ) : null;

  // NOTE: this MUST stay a memoized *element*, never a component defined in
  // the render body. When it was `const Contents = useCallback(...)` rendered
  // as `<Contents />`, every dependency change produced a new function
  // identity, so React saw a different element `type` and unmounted/remounted
  // this whole subtree — silently discarding SelectionCapture's in-progress
  // inline-comment form.
  const contents = useMemo(() => {
    if (isNotFound || page?.revision == null) {
      return <NotFoundPage path={pagePath} />;
    }

    const markdown = page.revision.body;

    return (
      <>
        <PageContentsUtilities />

        <div className="flex-expand-vert justify-content-between">
          <div ref={pageBodyContainerRef}>
            {isSlide != null ? (
              <SlideRenderer marp={isSlide.marp} markdown={markdown} />
            ) : (
              <PageContentRenderer
                rendererOptions={viewOptions}
                rendererConfig={rendererConfig}
                pagePath={pagePath}
                markdown={markdown}
              />
            )}
          </div>

          {!isIdenticalPathPage && !isNotFound && !isSharedPageView && (
            <>
              <SelectionCapture
                containerRef={pageBodyContainerRef}
                pageId={page._id}
                anchorOriginRevisionId={page.revision._id}
              />
              <InlineCommentHighlight
                containerRef={pageBodyContainerRef}
                resolvedRanges={resolvedInlineCommentRanges}
              />
              <InlineCommentBodyInteraction
                containerRef={pageBodyContainerRef}
                resolvedRanges={resolvedInlineCommentRanges}
                inlineComments={inlineComments ?? []}
                createReply={createInlineCommentReplyText}
                resolve={resolveInlineComment}
                rendererOptions={viewOptions}
              />

              <div id="comments-container" ref={commentsContainerRef}>
                <Comments
                  pageId={page._id}
                  pagePath={pagePath}
                  revision={page.revision}
                  inlineComments={inlineCommentsForComments}
                />
              </div>
            </>
          )}
        </div>
      </>
    );
  }, [
    isNotFound,
    page?.revision,
    page?._id,
    rendererConfig,
    pagePath,
    viewOptions,
    isSlide,
    isIdenticalPathPage,
    page,
    resolvedInlineCommentRanges,
    isSharedPageView,
    inlineCommentsForComments,
    inlineComments,
    createInlineCommentReplyText,
    resolveInlineComment,
  ]);

  return (
    <PageViewLayout
      className={className}
      headerContents={headerContents}
      sideContents={sideContents}
      footerContents={footerContents}
      expandContentWidth={shouldExpandContent}
    >
      {/*
        The `::highlight()` rule for the transient emphasis above. Reuses the
        existing themed marker family (`--grw-marker-bg-red`) rather than
        introducing a fourth inline-comment token: this is a one-off flash, not
        a state a theme needs to override independently, and red is the
        remaining marker colour that is unmistakably distinct from the saved
        (yellow) and pending (blue) inline-comment highlights in both colour
        modes. Declared globally, following InlineCommentHighlight's own
        pattern -- `CSS.highlights` is a document-level registry, so the rule
        cannot be component-scoped.
      */}
      <style jsx global>
        {`
          ::highlight(${EMPHASIS_HIGHLIGHT_NAME}) {
            background-color: var(--grw-marker-bg-red);
          }
        `}
      </style>

      <PageAlerts />

      {specialContents}
      {specialContents == null && (
        <>
          {isUsersHomepagePath && page?.creator != null && (
            <UserInfo author={page.creator} />
          )}
          <div id={contentContainerId} className="flex-expand-vert">
            {contents}
          </div>
        </>
      )}
    </PageViewLayout>
  );
};

export const PageView = memo(PageViewComponent, arePropsEqual);
PageView.displayName = 'PageView';
