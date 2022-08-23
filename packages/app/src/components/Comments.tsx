import React from 'react';

import { PageComment } from '~/components/PageComment';

import { CommentEditorLazyRenderer } from './PageComment/CommentEditorLazyRenderer';

export const Comments = (): JSX.Element => {


  return (
    <div className="page-comments-row mt-5 py-4 d-edit-none d-print-none">
      <div className="container-lg">

        <div className="page-comments">
          <div id="page-comments-list" className="page-comments-list">
            <PageComment />
          </div>

          {/* {% if page and not page.isDeleted() %} */}
          <div id="page-comment-write">
            <CommentEditorLazyRenderer />
          </div>
          {/* {% endif %} */}

        </div>

      </div>
    </div>
  );

};
