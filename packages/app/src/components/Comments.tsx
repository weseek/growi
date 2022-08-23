import React from 'react';

import { PageComment } from '~/components/PageComment';
import { useCommentPreviewOptions } from '~/stores/renderer';

import { CommentEditorLazyRenderer } from './PageComment/CommentEditorLazyRenderer';

type CommentsProps = {
  pageId?: string,
  isDeleted: boolean,
}

export const Comments = (props: CommentsProps): JSX.Element => {

  const { pageId, isDeleted } = props;

  const { data: rendererOptions } = useCommentPreviewOptions();

  if (rendererOptions == null) {
    return <></>;
  }

  return (
    // TODO: Check CSS import
    <div className="page-comments-row mt-5 py-4 d-edit-none d-print-none">
      <div className="container-lg">
        <div className="page-comments">
          <div id="page-comments-list" className="page-comments-list">
            <PageComment pageId={pageId} isReadOnly={false} titleAlign="left" />
          </div>
          { isDeleted && (
            <div id="page-comment-write">
              <CommentEditorLazyRenderer pageId={pageId} rendererOptions={rendererOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );

};
