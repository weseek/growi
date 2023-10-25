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
import { useSWRxPageComment } from '~/stores/comment';
import {
  useIsForbidden, useIsIdenticalPath, useIsNotCreatable,
} from '~/stores/context';
import { useSWRxCurrentPage, useIsNotFound } from '~/stores/page';
import { useViewOptions } from '~/stores/renderer';
import { useIsMobile } from '~/stores/ui';


import type { CommentsProps } from '../Comments';
import { PagePathNavSticky } from '../Common/PagePathNav';
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
    targetRect, selectedText, pageId, revisionId, onFocus,
  } = props;
  const { post: postComment } = useSWRxPageComment(pageId);

  const [commentBody, setCommentBody] = useState('');
  const inlineCommentBoxRef = useRef(null);
  const postCommentHandler = useCallback(async() => {
    console.log('postCommentHandler is called!', commentBody);
    const comment = `> ${selectedText}  \n\n ${commentBody}`;
    try {
      // post new comment
      const postCommentArgs = {
        commentForm: {
          comment,
          revisionId,
          replyTo: undefined,
        },
        slackNotificationForm: {
          isSlackEnabled: false,
          slackChannels: undefined,
        },
      };
      await postComment(postCommentArgs);

    }
    catch (err) {
      const errorMessage = err.message || 'An unknown error occured when posting comment';
      alert(errorMessage);
    }
  }, []);

  if (inlineCommentBoxRef != null && inlineCommentBoxRef.current != null && targetRect != null) {
    const { current } = inlineCommentBoxRef;
    const { top, left } = targetRect;
    console.log(current.style.top, targetRect.top);
    if (current.style != null) {
      console.log('changing styles');
      current.style.top = `${top}px`;
      current.style.left = `${left}px`;
    }
  }

  return (
    <div id="inlineCommentBox" className="position-absolute" ref={inlineCommentBoxRef}>
      <div className="card">
        <div className="card-body">
          <p>{selectedText}</p>
          <textarea
            name="comment-body"
            id="comment-body"
            cols={30}
            rows={1}
            className="form-control"
            onInput={(e) => {
              console.log('input changes', e);
              setCommentBody(e.target.value);
            }}
          >
          </textarea>
        </div>
        <div className="card-footer">
          <button type="button" onClick={postCommentHandler}>送信</button>
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
  const pageContentsWrapperRef = useRef<HTMLDivElement>(null);

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

  const headerContents = (
    <PagePathNavSticky pageId={page?._id} pagePath={pagePath} />
  );

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

  const [selectedRange, setSelectedRange] = useState<any>();
  const [selectedRangeText, setSelectedRangeText] = useState<string|null>('');
  const [targetRect, setTargetRect] = useState<any>();

  // TODO: Delete these experimental codes when the test is finished.
  const selectHandler = useCallback(() => {
    console.log('selectHandler is called.');

    const sel = document.getSelection();
    if (sel == null || sel.isCollapsed) return; // Detach if selected aria is invalid.
    const range = sel.getRangeAt(0);
    // console.log(sel);
    // Range selection disappears
    setSelectedRange(range); // <- this code has problem.
    // console.log(clientRect);
    const rangeContents = range.cloneContents();
    setSelectedRangeText(rangeContents.textContent);
    const clientRect = range.getBoundingClientRect();
    console.log(clientRect);
    setTargetRect(clientRect);

    // The following code will be used later.
    // const { firstElementChild } = range.cloneContents();
    // const isRangeStartWithSpan = firstElementChild?.nodeName === 'SPAN';
    // const isSelectedRange = firstElementChild?.getAttribute('selected') === 'selected';
    // if (isRangeStartWithSpan && isSelectedRange) return;
    // for (const childNode of newRangeContents.childNodes) {
    //   if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent != null) {
    //     const newNodeElement = document.createElement('span');
    //     newNodeElement.innerText = childNode.textContent;
    //     newNodeElement.setAttribute('style', 'background-color: blue;'); // Make the background of the range selection blue.
    //     newNodeElement.setAttribute('selected', 'selected');
    //     childNode.replaceWith(newNodeElement);
    //   }
    //   else {
    //     const newNodeElement = document.createElement('span');
    //     newNodeElement.setAttribute('selected', 'selected');
    //     // newNodeElement.setAttributes(...childNode.getAttributes());
    //     childNode.replaceWith(newNodeElement);
    //   }
    // }
    // // range.deleteContents(); // Delete range selection.
    // // range.detach();
    // // range.insertNode(newRangeContents); // Insert a qualified span from the beginning of the range selection.
    // const markerElement = document.createElement('selected');
    // markerElement.setAttribute('comment-id', 'undefined');
    // range.insertNode(markerElement);
  }, []);

  useEffect(() => {
    const selectionChangeHandler = debounce(1000, selectHandler);
    if (pageContentsWrapperRef != null && pageContentsWrapperRef.current != null) {
      console.log('useEffect is called.', pageContentsWrapperRef.current.addEventListener);
      pageContentsWrapperRef.current.addEventListener('selectstart', selectionChangeHandler);
    }
    return () => {
      if (pageContentsWrapperRef != null && pageContentsWrapperRef.current != null) {
        pageContentsWrapperRef.current.removeEventListener('selectstart', selectionChangeHandler);
      }
    };
  }, [selectHandler, pageContentsWrapperRef]);

  return (
    <PageViewLayout
      headerContents={headerContents}
      sideContents={sideContents}
      footerContents={footerContents}
    >
      <div className="position-relative">
        <PageAlerts />

        {specialContents}
        {specialContents == null && (
          <>
            {(isUsersHomepagePath && page?.creator != null) && <UserInfo author={page.creator} />}
            <div className={`mb-5 ${isMobile ? `page-mobile ${styles['page-mobile']}` : ''}`} ref={pageContentsWrapperRef}>
              <Contents />
            </div>
          </>
        )}

        { selectedRange != null && (
          <InlineCommentBox
            selectedText={selectedRangeText}
            pageId={page?._id}
            revisionId={page?.revision._id}
            targetRect={targetRect}
          />
        )}
      </div>
    </PageViewLayout>
  );
};
