import React from 'react';

import { IRevisionHasId } from '@growi/core';

import { PageComment } from '~/components/PageComment';
import { useCommentPreviewOptions } from '~/stores/renderer';

import { useIsTrashPage, useCurrentUser } from '../stores/context';

import { CommentEditorLazyRenderer } from './PageComment/CommentEditorLazyRenderer';

type CommentsProps = {
  pageId: string,
  revision: IRevisionHasId,
}

export const Comments = (props: CommentsProps): JSX.Element => {

  const { pageId, revision } = props;

  const { data: rendererOptions } = useCommentPreviewOptions();
  const { data: isDeleted } = useIsTrashPage();
  const { data: currentUser } = useCurrentUser();

  // TODO: Implement or refactor Skelton if server-side rendering
  if (rendererOptions == null || isDeleted == null) {
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
              <CommentEditorLazyRenderer
                pageId={pageId}
                rendererOptions={rendererOptions}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

};
