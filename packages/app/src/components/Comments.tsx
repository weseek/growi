import React from 'react';

import { IRevisionHasId } from '@growi/core';
import dynamic from 'next/dynamic';

import { PageCommentProps } from '~/components/PageComment';
import { useSWRxPageComment } from '~/stores/comment';
import { useIsTrashPage } from '~/stores/page';

import { useCurrentUser } from '../stores/context';

import { CommentEditorProps } from './PageComment/CommentEditor';

const PageComment = dynamic<PageCommentProps>(() => import('~/components/PageComment').then(mod => mod.PageComment), { ssr: false });
const CommentEditor = dynamic<CommentEditorProps>(() => import('./PageComment/CommentEditor').then(mod => mod.CommentEditor), { ssr: false });

type CommentsProps = {
  pageId: string,
  pagePath: string,
  revision: IRevisionHasId,
}

export const Comments = (props: CommentsProps): JSX.Element => {

  const { pageId, pagePath, revision } = props;

  const { mutate } = useSWRxPageComment(pageId);
  const { data: isDeleted } = useIsTrashPage();
  const { data: currentUser } = useCurrentUser();

  if (pageId == null) {
    return <></>;
  }

  return (
    <div className="page-comments-row mt-5 py-4 d-edit-none d-print-none">
      <div className="container-lg">
        <div className="page-comments">
          <div id="page-comments-list" className="page-comments-list">
            <PageComment
              pageId={pageId}
              pagePath={pagePath}
              revision={revision}
              currentUser={currentUser}
              isReadOnly={false}
              titleAlign="left"
              hideIfEmpty={false}
            />
          </div>
          { !isDeleted && (
            <div id="page-comment-write">
              <CommentEditor
                pageId={pageId}
                isForNewComment
                onCommentButtonClicked={mutate}
                revisionId={revision._id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

};
