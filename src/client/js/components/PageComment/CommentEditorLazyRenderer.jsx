import React from 'react';

import CommentEditor from './CommentEditor';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const CommentEditorLazyRenderer = () => {

  return (
    <CommentEditor
      replyTo={undefined}
      isForNewComment
    />
  );
};

export default CommentEditorLazyRenderer;
