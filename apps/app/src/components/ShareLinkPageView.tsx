import React, { useMemo, useState } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import type { UseSlide } from '@growi/presentation/dist/services';
import { parseSlideFrontmatterInMarkdown } from '@growi/presentation/dist/services';
import dynamic from 'next/dynamic';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import { useShouldExpandContent } from '~/client/services/layout';
import type { RendererConfig } from '~/interfaces/services/renderer';
import type { IShareLinkHasId } from '~/interfaces/share-link';
import { generateSSRViewOptions } from '~/services/renderer/renderer';
import { useIsNotFound } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import loggerFactory from '~/utils/logger';

import { PagePathNavSticky } from './Common/PagePathNav';
import { PageViewLayout } from './Common/PageViewLayout';
import RevisionRenderer from './Page/RevisionRenderer';
import ShareLinkAlert from './Page/ShareLinkAlert';
import type { PageSideContentsProps } from './PageSideContents';


const logger = loggerFactory('growi:Page');


const PageSideContents = dynamic<PageSideContentsProps>(() => import('./PageSideContents').then(mod => mod.PageSideContents), { ssr: false });
const ForbiddenPage = dynamic(() => import('./ForbiddenPage'), { ssr: false });
const SlideRenderer = dynamic(() => import('./Page/SlideRenderer').then(mod => mod.SlideRenderer), { ssr: false });

type Props = {
  pagePath: string,
  rendererConfig: RendererConfig,
  page?: IPagePopulatedToShowRevision,
  shareLink?: IShareLinkHasId,
  isExpired: boolean,
  disableLinkSharing: boolean,
}

export const ShareLinkPageView = (props: Props): JSX.Element => {
  const {
    pagePath, rendererConfig,
    page, shareLink,
    isExpired, disableLinkSharing,
  } = props;

  const [parseFrontmatterResult, setParseFrontmatterResult] = useState<UseSlide|undefined>();

  const { data: isNotFoundMeta } = useIsNotFound();

  const { data: viewOptions } = useViewOptions();

  const shouldExpandContent = useShouldExpandContent(page);

  const isNotFound = isNotFoundMeta || page == null || shareLink == null;

  const specialContents = useMemo(() => {
    if (disableLinkSharing) {
      return <ForbiddenPage isLinkSharingDisabled={props.disableLinkSharing} />;
    }
  }, [disableLinkSharing, props.disableLinkSharing]);

  useIsomorphicLayoutEffect(() => {
    if (isNotFound || page?.revision == null) {
      return;
    }

    const markdown = page.revision.body;

    (async() => {
      const parseFrontmatterResult = await parseSlideFrontmatterInMarkdown(markdown);

      if (parseFrontmatterResult != null) {
        setParseFrontmatterResult(parseFrontmatterResult);
      }
    })();
  }, []);

  const headerContents = (
    <PagePathNavSticky pageId={page?._id} pagePath={pagePath} />
  );

  const sideContents = !isNotFound
    ? (
      <PageSideContents page={page} />
    )
    : null;


  const Contents = () => {
    if (isNotFound || page.revision == null) {
      return <></>;
    }

    if (isExpired) {
      return (
        <>
          <h2 className="text-muted mt-4">
            <span className="material-symbols-outlined" aria-hidden="true">block</span>
            <span> Page is expired</span>
          </h2>
        </>
      );
    }

    const rendererOptions = viewOptions ?? generateSSRViewOptions(rendererConfig, pagePath);
    const markdown = page.revision.body;

    return parseFrontmatterResult != null
      ? <SlideRenderer marp={parseFrontmatterResult.marp} markdown={markdown} />
      : <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />;
  };

  return (
    <PageViewLayout
      headerContents={headerContents}
      sideContents={sideContents}
      expandContentWidth={shouldExpandContent}
    >
      { specialContents }
      { specialContents == null && (
        <>
          { isNotFound && (
            <h2 className="text-muted mt-4">
              <span className="material-symbols-outlined" aria-hidden="true">block</span>
              <span> Page is not found</span>
            </h2>
          ) }
          { !isNotFound && (
            <>
              <ShareLinkAlert expiredAt={shareLink.expiredAt} createdAt={shareLink.createdAt} />
              <div className="mb-5">
                <Contents />
              </div>
            </>
          ) }
        </>
      ) }
    </PageViewLayout>
  );
};
