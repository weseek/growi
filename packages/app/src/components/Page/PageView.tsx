import React, { useEffect, useMemo } from 'react';

import { type IPagePopulatedToShowRevision, pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';


import { generateSSRViewOptions } from '~/services/renderer/renderer';
import {
  useIsForbidden, useIsIdenticalPath, useIsNotCreatable, useIsNotFound,
} from '~/stores/context';
import { useViewOptions } from '~/stores/renderer';
import { useIsMobile } from '~/stores/ui';
import { registerGrowiFacade } from '~/utils/growi-facade';

import type { CommentsProps } from '../Comments';
import { MainPane } from '../Layout/MainPane';
import { PageAlerts } from '../PageAlert/PageAlerts';
import { PageContentFooter } from '../PageContentFooter';
import type { PageSideContentsProps } from '../PageSideContents';
import { UserInfo } from '../User/UserInfo';
import type { UsersHomePageFooterProps } from '../UsersHomePageFooter';

import { PageContents } from './PageContents';

import styles from './PageView.module.scss';


const { isUsersHomePage } = pagePathUtils;


const NotCreatablePage = dynamic(() => import('../NotCreatablePage').then(mod => mod.NotCreatablePage), { ssr: false });
const ForbiddenPage = dynamic(() => import('../ForbiddenPage'), { ssr: false });
const NotFoundPage = dynamic(() => import('../NotFoundPage'), { ssr: false });
const PageSideContents = dynamic<PageSideContentsProps>(() => import('../PageSideContents').then(mod => mod.PageSideContents), { ssr: false });
const Comments = dynamic<CommentsProps>(() => import('../Comments').then(mod => mod.Comments), { ssr: false });
const UsersHomePageFooter = dynamic<UsersHomePageFooterProps>(() => import('../UsersHomePageFooter')
  .then(mod => mod.UsersHomePageFooter), { ssr: false });
const IdenticalPathPage = dynamic(() => import('../IdenticalPathPage').then(mod => mod.IdenticalPathPage), { ssr: false });


type Props = {
  pagePath: string,
  page?: IPagePopulatedToShowRevision,
}

export const PageView = (props: Props): JSX.Element => {
  const {
    pagePath, page,
  } = props;

  const pageId = page?._id;

  const { data: isIdenticalPathPage } = useIsIdenticalPath();
  const { data: isForbidden } = useIsForbidden();
  const { data: isNotCreatable } = useIsNotCreatable();
  const { data: isNotFound } = useIsNotFound();
  const { data: isMobile } = useIsMobile();

  const { mutate: mutateRendererOptions } = useViewOptions();

  // register to facade
  useEffect(() => {
    registerGrowiFacade({
      markdownRenderer: {
        optionsMutators: {
          viewOptionsMutator: mutateRendererOptions,
        },
      },
    });
  }, [mutateRendererOptions]);

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
    if (isNotFound) {
      return <NotFoundPage path={pagePath} />;
    }
  }, [isForbidden, isIdenticalPathPage, isNotCreatable, isNotFound, pagePath]);

  const sideContents = !isNotFound && !isNotCreatable
    ? (
      <PageSideContents page={page} />
    )
    : null;

  const footerContents = !isIdenticalPathPage && !isNotFound && page != null
    ? (
      <>
        { pageId != null && pagePath != null && (
          <Comments pageId={pageId} pagePath={pagePath} revision={page.revision} />
        ) }
        { pagePath != null && isUsersHomePage(pagePath) && (
          <UsersHomePageFooter creatorId={page.creator._id}/>
        ) }
        <PageContentFooter page={page} />
      </>
    )
    : null;

  const isUsersHomePagePath = isUsersHomePage(pagePath);

  const contents = specialContents != null
    ? <></>
    // TODO: show SSR body
    // : (() => {
    //   const PageContents = dynamic(() => import('./PageContents').then(mod => mod.PageContents), {
    //     ssr: false,
    //     // loading: () => ssrBody ?? <></>,
    //   });
    //   return <PageContents />;
    // })();
    : <PageContents />;

  return (
    <MainPane
      sideContents={sideContents}
      footerContents={footerContents}
    >
      <PageAlerts />

      { specialContents }
      { specialContents == null && (
        <>
          { isUsersHomePagePath && <UserInfo author={page?.creator} /> }
          <div className={`mb-5 ${isMobile ? `page-mobile ${styles['page-mobile']}` : ''}`}>
            { contents }
          </div>
        </>
      ) }

    </MainPane>
  );
};
