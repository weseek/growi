import React, { useMemo } from 'react';

import { type IPagePopulatedToShowRevision, pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';


import { useHackmdDraftUpdatedEffect } from '~/client/services/side-effects/hackmd-draft-updated';
import { useHashChangedEffect } from '~/client/services/side-effects/hash-changed';
import { usePageUpdatedEffect } from '~/client/services/side-effects/page-updated';
import { useIsEditable } from '~/stores/context';
import { EditorMode, useEditorMode } from '~/stores/ui';

import { LazyRenderer } from '../Common/LazyRenderer';
import { MainPane } from '../Layout/MainPane';
import { PageAlerts } from '../PageAlert/PageAlerts';
import { PageContentFooter } from '../PageContentFooter';
import type { PageSideContentsProps } from '../PageSideContents';
import { UserInfo } from '../User/UserInfo';
import type { UsersHomePageFooterProps } from '../UsersHomePageFooter';

const { isUsersHomePage } = pagePathUtils;


const NotCreatablePage = dynamic(() => import('../NotCreatablePage').then(mod => mod.NotCreatablePage), { ssr: false });
const ForbiddenPage = dynamic(() => import('../ForbiddenPage'), { ssr: false });
const NotFoundPage = dynamic(() => import('../NotFoundPage'), { ssr: false });
const PageSideContents = dynamic<PageSideContentsProps>(() => import('../PageSideContents').then(mod => mod.PageSideContents), { ssr: false });
const Comments = dynamic(() => import('../Comments').then(mod => mod.Comments), { ssr: false });
const UsersHomePageFooter = dynamic<UsersHomePageFooterProps>(() => import('../UsersHomePageFooter')
  .then(mod => mod.UsersHomePageFooter), { ssr: false });

const PageEditor = dynamic(() => import('../PageEditor'), { ssr: false });
const PageEditorByHackmd = dynamic(() => import('../PageEditorByHackmd').then(mod => mod.PageEditorByHackmd), { ssr: false });
const EditorNavbarBottom = dynamic(() => import('../PageEditor/EditorNavbarBottom'), { ssr: false });


const IdenticalPathPage = (): JSX.Element => {
  const IdenticalPathPage = dynamic(() => import('../IdenticalPathPage').then(mod => mod.IdenticalPathPage), { ssr: false });
  return <IdenticalPathPage />;
};


type Props = {
  pagePath: string,
  page?: IPagePopulatedToShowRevision,
  isIdenticalPathPage?: boolean,
  isNotFound?: boolean,
  isForbidden?: boolean,
  isNotCreatable?: boolean,
  ssrBody?: JSX.Element,
}

const View = (props: Props): JSX.Element => {
  const {
    pagePath, page,
    isIdenticalPathPage, isNotFound, isForbidden, isNotCreatable,
    ssrBody,
  } = props;

  const pageId = page?._id;

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
      return <NotFoundPage />;
    }
  }, [isForbidden, isIdenticalPathPage, isNotCreatable, isNotFound]);

  const sideContents = !isNotFound && !isNotCreatable
    ? (
      <PageSideContents page={page} />
    )
    : <></>;

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
    : <></>;

  const isUsersHomePagePath = isUsersHomePage(pagePath);

  const contents = specialContents != null
    ? <></>
    : (() => {
      const Page = dynamic(() => import('./Page').then(mod => mod.Page), {
        ssr: false,
        loading: () => ssrBody ?? <></>,
      });
      return <Page />;
    })();

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
          { contents }
        </>
      ) }

    </MainPane>
  );
};

export const DisplaySwitcher = (props: Props): JSX.Element => {

  const { data: editorMode = EditorMode.View } = useEditorMode();
  const { data: isEditable } = useIsEditable();

  usePageUpdatedEffect();
  useHashChangedEffect();
  useHackmdDraftUpdatedEffect();

  const isViewMode = editorMode === EditorMode.View;

  return (
    <>
      { isViewMode && <View {...props} /> }

      <LazyRenderer shouldRender={isEditable === true && editorMode === EditorMode.Editor}>
        <div data-testid="page-editor" id="page-editor" className="editor-root">
          <PageEditor />
        </div>
      </LazyRenderer>

      <LazyRenderer shouldRender={isEditable === true && editorMode === EditorMode.HackMD}>
        <div id="page-editor-with-hackmd" className="editor-root">
          <PageEditorByHackmd />
        </div>
      </LazyRenderer>

      { isEditable && !isViewMode && <EditorNavbarBottom /> }
    </>
  );
};
