import React, {
  useCallback,
  useEffect, useMemo, useRef, useState,
} from 'react';

import type { IPagePopulatedToShowRevision } from '@growi/core';
import { isUsersHomepage } from '@growi/core/dist/utils/page-path-utils';
import dynamic from 'next/dynamic';
import { debounce } from 'throttle-debounce';

import { apiPost } from '~/client/util/apiv1-client';
import type { RendererConfig } from '~/interfaces/services/renderer';
import { generateSSRViewOptions } from '~/services/renderer/renderer';
import {
  useIsForbidden, useIsIdenticalPath, useIsNotCreatable,
} from '~/stores/context';
import { useSWRxCurrentPage, useIsNotFound } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import { useIsMobile } from '~/stores/ui';


import type { CommentsProps } from '../Comments';
import { PageViewLayout } from '../Layout/PageViewLayout';
import { PageAlerts } from '../PageAlert/PageAlerts';
import { PageContentFooter } from '../PageContentFooter';
import type { PageSideContentsProps } from '../PageSideContents';
import { UserInfo } from '../User/UserInfo';
import type { UsersHomepageFooterProps } from '../UsersHomepageFooter';

import RevisionRenderer from './RevisionRenderer';

import styles from './PageView.module.scss';


const NotCreatablePage = dynamic(() => import('../NotCreatablePage').then(mod => mod.NotCreatablePage), { ssr: false });
const ForbiddenPage = dynamic(() => import('../ForbiddenPage'), { ssr: false });
const NotFoundPage = dynamic(() => import('../NotFoundPage'), { ssr: false });
const PageSideContents = dynamic<PageSideContentsProps>(() => import('../PageSideContents').then(mod => mod.PageSideContents), { ssr: false });
const PageContentsUtilities = dynamic(() => import('./PageContentsUtilities').then(mod => mod.PageContentsUtilities), { ssr: false });
const Comments = dynamic<CommentsProps>(() => import('../Comments').then(mod => mod.Comments), { ssr: false });
const UsersHomepageFooter = dynamic<UsersHomepageFooterProps>(() => import('../UsersHomepageFooter')
  .then(mod => mod.UsersHomepageFooter), { ssr: false });
const IdenticalPathPage = dynamic(() => import('../IdenticalPathPage').then(mod => mod.IdenticalPathPage), { ssr: false });

const InlineCommentBox = (props: any): JSX.Element => {
  const {
    positionX, positionY, text, pageId, revisionId,
  } = props;

  const onSubmit = (data) => {
    const {};
    await apiPost('/comments.add', {
      commentForm: {
        comment,
        page_id: pageId,
        revision_id: revisionId,
        replyTo,
      },
      slackNotificationForm: {
        isSlackEnabled,
        slackChannels,
      },
    });
  };

  return (
    <div className="position-absolute">
      <div className="card">
        <div className="card-header">
          {text}
        </div>
        <div className="card-body">
          <textarea name="" id="" cols={30} rows={10} className="form-control"></textarea>
        </div>
        <div className="card-footer">
          <button type="button" onSubmit={onSubmit}>送信</button>
        </div>
      </div>
    </div>
  );
};

type Props = {
  pagePath: string,
  rendererConfig: RendererConfig,
  initialPage?: IPagePopulatedToShowRevision,
}

export const PageView = (props: Props): JSX.Element => {

  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const [isCommentsLoaded, setCommentsLoaded] = useState(false);

  const {
    pagePath, initialPage, rendererConfig,
  } = props;

  const { data: isIdenticalPathPage } = useIsIdenticalPath();
  const { data: isForbidden } = useIsForbidden();
  const { data: isNotCreatable } = useIsNotCreatable();
  const { data: isNotFoundMeta } = useIsNotFound();
  const { data: isMobile } = useIsMobile();

  const { data: pageBySWR } = useSWRxCurrentPage();
  const { data: viewOptions } = useViewOptions();

  const page = pageBySWR ?? initialPage;
  const isNotFound = isNotFoundMeta || page?.revision == null;
  const isUsersHomepagePath = isUsersHomepage(pagePath);


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

  const sideContents = !isNotFound && !isNotCreatable
    ? (
      <PageSideContents page={page} />
    )
    : null;

  const footerContents = !isIdenticalPathPage && !isNotFound
    ? (
      <>
        <div id="comments-container" ref={commentsContainerRef}>
          <Comments
            pageId={page._id}
            pagePath={pagePath}
            revision={page.revision}
            onLoaded={() => setCommentsLoaded(true)}
          />
        </div>
        {(isUsersHomepagePath && page.creator != null) && (
          <UsersHomepageFooter creatorId={page.creator._id} />
        )}
        <PageContentFooter page={page} />
      </>
    )
    : null;

  const Contents = () => {
    if (isNotFound) {
      return <NotFoundPage path={pagePath} />;
    }

    const rendererOptions = viewOptions ?? generateSSRViewOptions(rendererConfig, pagePath);
    rendererOptions.sourcePos = true;
    const markdown = page.revision.body;

    return (
      <>
        <PageContentsUtilities />
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />
      </>
    );
  };

  // TODO: Delete these experimental codes when the test is finished.
  const selectHandler = useCallback(() => {
    const sel = document.getSelection();
    if (sel == null || sel.isCollapsed) return; // Detach if selected aria is invalid.
    const range = sel.getRangeAt(0);
    const newRangeContents = range.cloneContents();
    const { firstElementChild } = range.cloneContents();
    const isRangeStartWithSpan = firstElementChild?.nodeName === 'SPAN';
    const isSelectedRange = firstElementChild?.getAttribute('selected') === 'selected';
    if (isRangeStartWithSpan && isSelectedRange) return;
    for (const childNode of newRangeContents.childNodes) {
      if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent != null) {
        const newNodeElement = document.createElement('span');
        newNodeElement.innerText = childNode.textContent;
        newNodeElement.setAttribute('style', 'background-color: blue;'); // Make the background of the range selection blue.
        newNodeElement.setAttribute('selected', 'selected');
        childNode.replaceWith(newNodeElement);
      }
      else {
        const newNodeElement = document.createElement('span');
        newNodeElement.setAttribute('selected', 'selected');
        // newNodeElement.setAttributes(...childNode.getAttributes());
        childNode.replaceWith(newNodeElement);
      }
    }
    // range.deleteContents(); // Delete range selection.
    // range.detach();
    // range.insertNode(newRangeContents); // Insert a qualified span from the beginning of the range selection.
    const markerElement = document.createElement('selected');
    markerElement.setAttribute('comment-id', 'undefined');
    range.insertNode(markerElement);
  }, []);

  useEffect(() => {
    const selectionChangeHandler = debounce(1000, selectHandler);
    document.addEventListener('selectionchange', selectionChangeHandler);
    return () => {
      document.removeEventListener('selectionchange', selectionChangeHandler);
    };
  }, [selectHandler]);

  return (
    <PageViewLayout
      sideContents={sideContents}
      footerContents={footerContents}
    >
      <div className="position-relative">
        <PageAlerts />

        {specialContents}
        {specialContents == null && (
          <>
            {(isUsersHomepagePath && page?.creator != null) && <UserInfo author={page.creator} />}
            <div className={`mb-5 ${isMobile ? `page-mobile ${styles['page-mobile']}` : ''}`}>
              <Contents />
            </div>
          </>
        )}

        <InlineCommentBox />
      </div>
    </PageViewLayout>
  );
};
