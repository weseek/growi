import React, {
  useEffect, useMemo, useRef, useState,
} from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { isUsersHomepage } from '@growi/core/dist/utils/page-path-utils';
import { useSlidesByFrontmatter } from '@growi/presentation/dist/services';
import dynamic from 'next/dynamic';

import type { RendererConfig } from '~/interfaces/services/renderer';
import { useShouldExpandContent } from '~/services/layout/use-should-expand-content';
import { generateSSRViewOptions } from '~/services/renderer/renderer';
import {
  useIsForbidden, useIsIdenticalPath, useIsNotCreatable,
} from '~/stores/context';
import { useSWRxCurrentPage, useIsNotFound } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import { useIsMobile } from '~/stores/ui';

import { PagePathNavSticky } from '../Common/PagePathNav';
import { PageViewLayout } from '../Common/PageViewLayout';
import { PageAlerts } from '../PageAlert/PageAlerts';
import { PageContentFooter } from '../PageContentFooter';
import { UserInfo } from '../User/UserInfo';

import RevisionRenderer from './RevisionRenderer';

import styles from './PageView.module.scss';


const NotCreatablePage = dynamic(() => import('../NotCreatablePage').then(mod => mod.NotCreatablePage), { ssr: false });
const ForbiddenPage = dynamic(() => import('../ForbiddenPage'), { ssr: false });
const NotFoundPage = dynamic(() => import('../NotFoundPage'), { ssr: false });
const PageSideContents = dynamic(() => import('../PageSideContents').then(mod => mod.PageSideContents), { ssr: false });
const PageContentsUtilities = dynamic(() => import('./PageContentsUtilities').then(mod => mod.PageContentsUtilities), { ssr: false });
const Comments = dynamic(() => import('../Comments').then(mod => mod.Comments), { ssr: false });
const UsersHomepageFooter = dynamic(() => import('../UsersHomepageFooter')
  .then(mod => mod.UsersHomepageFooter), { ssr: false });
const IdenticalPathPage = dynamic(() => import('../IdenticalPathPage').then(mod => mod.IdenticalPathPage), { ssr: false });
const SlideRenderer = dynamic(() => import('./SlideRenderer').then(mod => mod.SlideRenderer), { ssr: false });


type Props = {
  pagePath: string,
  rendererConfig: RendererConfig,
  initialPage?: IPagePopulatedToShowRevision,
  className?: string,
}

export const PageView = (props: Props): JSX.Element => {

  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const [isCommentsLoaded, setCommentsLoaded] = useState(false);

  const {
    pagePath, initialPage, rendererConfig, className,
  } = props;

  const { data: isIdenticalPathPage } = useIsIdenticalPath();
  const { data: isForbidden } = useIsForbidden();
  const { data: isNotCreatable } = useIsNotCreatable();
  const { data: isNotFoundMeta } = useIsNotFound();
  const { data: isMobile } = useIsMobile();

  const { data: pageBySWR } = useSWRxCurrentPage();
  const { data: viewOptions } = useViewOptions();

  const page = pageBySWR ?? initialPage;
  const isNotFound = isNotFoundMeta || page == null;
  const isUsersHomepagePath = isUsersHomepage(pagePath);

  const shouldExpandContent = useShouldExpandContent(page);


  const markdown = page?.revision?.body;
  const isSlide = useSlidesByFrontmatter(markdown, rendererConfig.isEnabledMarp);


  // ***************************  Auto Scroll  ***************************
  useEffect(() => {
    // do nothing if hash is empty
    const { hash } = window.location;
    if (hash.length === 0) {
      return;
    }

    const targetId = hash.slice(1);

    const target = document.getElementById(decodeURIComponent(targetId));
    target?.scrollIntoView();

  }, [isCommentsLoaded]);
  // *******************************  end  *******************************


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
    <PagePathNavSticky pageId={page?._id} pagePath={pagePath} isWipPage={page?.wip} />
  );

  const sideContents = !isNotFound && !isNotCreatable
    ? (
      <PageSideContents page={page} />
    )
    : null;

  const footerContents = !isIdenticalPathPage && !isNotFound
    ? (
      <>
        {(isUsersHomepagePath && page.creator != null) && (
          <UsersHomepageFooter creatorId={page.creator._id} />
        )}
        <PageContentFooter page={page} />
      </>
    )
    : null;

  const Contents = () => {
    if (isNotFound || page?.revision == null) {
      return <NotFoundPage path={pagePath} />;
    }

    const markdown = page.revision.body;
    const rendererOptions = viewOptions ?? generateSSRViewOptions(rendererConfig, pagePath);

    return (
      <>
        <PageContentsUtilities />

        <div className="flex-expand-vert justify-content-between">

          { isSlide != null
            ? <SlideRenderer marp={isSlide.marp} markdown={markdown} />
            : <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />
          }

          { !isIdenticalPathPage && !isNotFound && (
            <div id="comments-container" ref={commentsContainerRef}>
              <Comments
                pageId={page._id}
                pagePath={pagePath}
                revision={page.revision}
                onLoaded={() => setCommentsLoaded(true)}
              />
            </div>
          ) }
        </div>
      </>
    );
  };

  const mobileClass = isMobile ? styles['page-mobile'] : '';

  return (
    <PageViewLayout
      className={className}
      headerContents={headerContents}
      sideContents={sideContents}
      footerContents={footerContents}
      expandContentWidth={shouldExpandContent}
    >
      <PageAlerts />

      {specialContents}
      {specialContents == null && (
        <>
          {(isUsersHomepagePath && page?.creator != null) && <UserInfo author={page.creator} />}
          <div className={`flex-expand-vert ${mobileClass}`}>
            <Contents />
          </div>
        </>
      )}

    </PageViewLayout>
  );
};
