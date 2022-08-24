import React from 'react';

import { PageComment } from '~/components/PageComment';
import { useCommentPreviewOptions } from '~/stores/renderer';

import { useIsTrashPage } from '../stores/context';

import { CommentEditorLazyRenderer } from './PageComment/CommentEditorLazyRenderer';

type CommentsProps = {
  pageId?: string,
}

export const Comments = (props: CommentsProps): JSX.Element => {

  const { pageId } = props;

  const { data: rendererOptions } = useCommentPreviewOptions();
  const { data: isDeleted } = useIsTrashPage();

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
            <PageComment pageId={pageId} isReadOnly={false} titleAlign="left" />
          </div>
          { !isDeleted && (
            <div id="page-comment-write">
              <CommentEditorLazyRenderer pageId={pageId} rendererOptions={rendererOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

};
