import React, { useMemo } from 'react';

import { type IPagePopulatedToShowRevision, pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';


import { useHackmdDraftUpdatedEffect } from '~/client/services/event-listeners/hackmd-draft-updated';
import { useHashChangedEffect } from '~/client/services/event-listeners/hash-changed';
import { usePageUpdatedEffect } from '~/client/services/event-listeners/page-updated';
import { useIsEditable } from '~/stores/context';
import { EditorMode, useEditorMode } from '~/stores/ui';

import CustomTabContent from '../CustomNavigation/CustomTabContent';
import { MainPane } from '../Layout/MainPane';
import { Page } from '../Page';
import { PageAlerts } from '../PageAlert/PageAlerts';
import { PageContentFooter } from '../PageContentFooter';
import type { PageSideContentsProps } from '../PageSideContents';
import type { UsersHomePageFooterProps } from '../UsersHomePageFooter';

const { isUsersHomePage } = pagePathUtils;


const NotCreatablePage = dynamic(() => import('../NotCreatablePage').then(mod => mod.NotCreatablePage), { ssr: false });
const ForbiddenPage = dynamic(() => import('../ForbiddenPage'), { ssr: false });
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
  page?: IPagePopulatedToShowRevision,
  isIdenticalPathPage?: boolean,
  isNotFound?: boolean,
  isForbidden?: boolean,
  isNotCreatable?: boolean,
}

const View = (props: Props): JSX.Element => {
  const {
    page,
    isIdenticalPathPage, isNotFound, isForbidden, isNotCreatable,
  } = props;

  const pageId = page?._id;
  const pagePath = page?.path;

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

  return (
    <MainPane
      sideContents={sideContents}
      footerContents={footerContents}
    >
      <PageAlerts />
      { props.isIdenticalPathPage && <IdenticalPathPage />}
      { !props.isIdenticalPathPage && (
        <>
          { isForbidden && <ForbiddenPage /> }
          { isNotCreatable && <NotCreatablePage />}
          { !isForbidden && !props.isNotCreatable && <Page /> }
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

  const view = useMemo(() => <View {...props} />, [props]);
  const editor = useMemo(() => {
    return isEditable
      ? (
        <div data-testid="page-editor" id="page-editor">
          <PageEditor />
        </div>
      )
      : <></>;
  }, [isEditable]);
  const hackmd = useMemo(() => {
    return isEditable
      ? (
        <div id="page-editor-with-hackmd">
          <PageEditorByHackmd />
        </div>
      )
      : <></>;
  }, [isEditable]);

  const navTabMapping = useMemo(() => {
    return {
      [EditorMode.View]: {
        Content: () => view,
      },
      [EditorMode.Editor]: {
        Content: () => editor,
      },
      [EditorMode.HackMD]: {
        Content: () => hackmd,
      },
    };
  }, [editor, hackmd, view]);


  return (
    <>
      <CustomTabContent activeTab={editorMode} navTabMapping={navTabMapping} />

      { isEditable && !isViewMode && <EditorNavbarBottom /> }
    </>
  );
};
