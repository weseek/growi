import React, { useRef } from 'react';

import type { IRevisionHasId } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { useRenderedObserver } from '@growi/ui/dist/utils';
import dynamic from 'next/dynamic';

import { type PageCommentProps } from '~/components/PageComment';
import { useSWRxPageComment } from '~/features/comment/client';
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

  useRenderedObserver(pageCommentParentRef, {
    onRendered: onLoaded,
  });

  const isTopPagePath = isTopPage(pagePath);

  if (pageId == null || isTopPagePath) {
    return <></>;
  }

  const onCommentButtonClickHandler = () => {
    mutate();
    mutatePageInfo();
  };

  return (
    <div className="page-comments-row mt-5 py-4 border-top border-3 d-edit-none d-print-none">
      <div id="page-comments-list" className="page-comments-list" ref={pageCommentParentRef}>
        <PageComment
          pageId={pageId}
          pagePath={pagePath}
          revision={revision}
          currentUser={currentUser}
          isReadOnly={false}
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
  );

};
