import React, { useMemo } from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import dynamic from 'next/dynamic';

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
import { PageContentFooter } from './PageContentFooter';
import type { PageSideContentsProps } from './PageSideContents';


const logger = loggerFactory('growi:Page');


const PageSideContents = dynamic<PageSideContentsProps>(() => import('./PageSideContents').then(mod => mod.PageSideContents), { ssr: false });
const ForbiddenPage = dynamic(() => import('./ForbiddenPage'), { ssr: false });


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

  const { data: isNotFoundMeta } = useIsNotFound();

  const { data: viewOptions } = useViewOptions();

  const shouldExpandContent = useShouldExpandContent(page);

  const isNotFound = isNotFoundMeta || page == null || shareLink == null;

  const specialContents = useMemo(() => {
    if (disableLinkSharing) {
      return <ForbiddenPage isLinkSharingDisabled={props.disableLinkSharing} />;
    }
  }, [disableLinkSharing, props.disableLinkSharing]);

  const headerContents = (
    <PagePathNavSticky pageId={page?._id} pagePath={pagePath} />
  );

  const sideContents = !isNotFound
    ? (
      <PageSideContents page={page} />
    )
    : null;


  const footerContents = !isNotFound
    ? (
      <PageContentFooter page={page} />
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

    return (
      <>
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />
      </>
    );
  };

  return (
    <PageViewLayout
      headerContents={headerContents}
      sideContents={sideContents}
      expandContentWidth={shouldExpandContent}
      footerContents={footerContents}
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
