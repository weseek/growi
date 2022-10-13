import React from 'react';

import { IRevisionHasId } from '@growi/core';
import dynamic from 'next/dynamic';

import { PageComment } from '~/components/PageComment';
import { useSWRxPageComment } from '~/stores/comment';

import { useIsTrashPage, useCurrentUser } from '../stores/context';

import { CommentEditorProps } from './PageComment/CommentEditor';


const CommentEditor = dynamic<CommentEditorProps>(() => import('./PageComment/CommentEditor').then(mod => mod.CommentEditor), { ssr: false });


type CommentsProps = {
  pageId: string,
  revision: IRevisionHasId,
}

export const Comments = (props: CommentsProps): JSX.Element => {

  const { pageId, revision } = props;

  const { mutate } = useSWRxPageComment(pageId);
  const { data: isDeleted } = useIsTrashPage();
  const { data: currentUser } = useCurrentUser();

  if (pageId == null) {
    return <></>;
  }

  return (
    // TODO: Check and refactor CSS import
    <div className="page-comments-row mt-5 py-4 d-edit-none d-print-none">
      <div className="container-lg">
        <div className="page-comments">
          <div id="page-comments-list" className="page-comments-list">
            <PageComment
              pageId={pageId}
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
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

};
