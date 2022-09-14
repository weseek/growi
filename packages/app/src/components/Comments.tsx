import React from 'react';

import dynamic from 'next/dynamic';

import { PageComment } from '~/components/PageComment';
import { useSWRxPageComment } from '~/stores/comment';

import { useIsTrashPage } from '../stores/context';

import { CommentEditorProps } from './PageComment/CommentEditor';


const CommentEditor = dynamic<CommentEditorProps>(() => import('./PageComment/CommentEditor').then(mod => mod.CommentEditor), { ssr: false });


type CommentsProps = {
  pageId?: string,
}

export const Comments = (props: CommentsProps): JSX.Element => {

  const { pageId } = props;

  const { mutate } = useSWRxPageComment(pageId);
  const { data: isDeleted } = useIsTrashPage();

  if (pageId == null) {
    return <></>;
  }

  return (
    // TODO: Check and refactor CSS import
    <div className="page-comments-row mt-5 py-4 d-edit-none d-print-none">
      <div className="container-lg">
        <div className="page-comments">
          <div id="page-comments-list" className="page-comments-list">
            <PageComment pageId={pageId} isReadOnly={false} titleAlign="left" />
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
