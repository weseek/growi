import React, { useEffect, useMemo, useRef } from 'react';

import { type IRevisionHasId, pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';
import { debounce } from 'throttle-debounce';

import { type PageCommentProps } from '~/components/PageComment';
import { useSWRxPageComment } from '~/stores/comment';
import { useIsTrashPage, useSWRMUTxPageInfo } from '~/stores/page';

import { useCurrentUser } from '../stores/context';

import type { CommentEditorProps } from './PageComment/CommentEditor';


const { isTopPage } = pagePathUtils;


const PageComment = dynamic<PageCommentProps>(() => import('~/components/PageComment').then(mod => mod.PageComment), { ssr: false });
const CommentEditor = dynamic<CommentEditorProps>(() => import('./PageComment/CommentEditor').then(mod => mod.CommentEditor), { ssr: false });

export type CommentsProps = {
  pageId: string,
  pagePath: string,
  revision: IRevisionHasId,
  onLoaded?: () => void,
}

export const Comments = (props: CommentsProps): JSX.Element => {

  const {
    pageId, pagePath, revision, onLoaded,
  } = props;

  const { mutate } = useSWRxPageComment(pageId);
  const { trigger: mutatePageInfo } = useSWRMUTxPageInfo(pageId);
  const { data: isDeleted } = useIsTrashPage();
  const { data: currentUser } = useCurrentUser();

  const pageCommentParentRef = useRef<HTMLDivElement>(null);

  const onLoadedDebounced = useMemo(() => debounce(500, () => onLoaded?.()), [onLoaded]);

  useEffect(() => {
    const parent = pageCommentParentRef.current;
    if (parent == null) return;

    const observer = new MutationObserver(() => {
      onLoadedDebounced();
    });
    observer.observe(parent, { childList: true, subtree: true });

    // no cleanup function -- 2023.07.31 Yuki Takei
    // see: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
    // > You can call observe() multiple times on the same MutationObserver
    // > to watch for changes to different parts of the DOM tree and/or different types of changes.
  }, [onLoaded]);

  const isTopPagePath = isTopPage(pagePath);

  if (pageId == null || isTopPagePath) {
    return <></>;
  }

  const onCommentButtonClickHandler = () => {
    mutate();
    mutatePageInfo();
  };

  return (
    <div className="page-comments-row mt-5 py-4 d-edit-none d-print-none">
      <div className="container-lg">
        <div id="page-comments-list" className="page-comments-list" ref={pageCommentParentRef}>
          <PageComment
            pageId={pageId}
            pagePath={pagePath}
            revision={revision}
            currentUser={currentUser}
            isReadOnly={false}
            titleAlign="left"
          />
        </div>
        {!isDeleted && (
          <div id="page-comment-write">
            <CommentEditor
              pageId={pageId}
              isForNewComment
              onCommentButtonClicked={onCommentButtonClickHandler}
              revisionId={revision._id}
            />
          </div>
        )}
      </div>
    </div>
  );

};
