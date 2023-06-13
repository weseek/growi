import React, { useEffect, useRef } from 'react';

import { type IRevisionHasId, pagePathUtils } from '@growi/core';
import dynamic from 'next/dynamic';

import { ROOT_ELEM_ID as PageCommentRootElemId, type PageCommentProps } from '~/components/PageComment';
import { useSWRxPageComment } from '~/stores/comment';
import { useIsTrashPage } from '~/stores/page';

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
  onCommentCountUpdated?: () => void,
}

export const Comments = (props: CommentsProps): JSX.Element => {

  const {
    pageId, pagePath, revision, onLoaded, onCommentCountUpdated,
  } = props;

  const { mutate } = useSWRxPageComment(pageId);
  const { data: isDeleted } = useIsTrashPage();
  const { data: currentUser } = useCurrentUser();

  const pageCommentParentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = pageCommentParentRef.current;
    if (parent == null) return;

    const observerCallback = (mutationRecords: MutationRecord[]) => {
      mutationRecords.forEach((record: MutationRecord) => {
        const target = record.target as HTMLElement;

        for (const child of Array.from(target.children)) {
          const childId = (child as HTMLElement).id;
          if (childId === PageCommentRootElemId) {
            onLoaded?.();
            break;
          }
        }

      });
    };

    const observer = new MutationObserver(observerCallback);
    observer.observe(parent, { childList: true });
    return () => {
      observer.disconnect();
    };
  }, [onLoaded]);

  const isTopPagePath = isTopPage(pagePath);

  if (pageId == null || isTopPagePath) {
    return <></>;
  }

  const onCommentButtonClickHandler = () => {
    mutate();
    if (onCommentCountUpdated != null) {
      onCommentCountUpdated();
    }
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
            hideIfEmpty={false}
            onCommentCountUpdated={onCommentCountUpdated}
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
