import React, { FC } from 'react';

import { useSWRxPageComment } from '../../stores/comment';

import { CommentEditor } from './CommentEditor';

type Props = {
  pageId: string,
}

const CommentEditorLazyRenderer:FC<Props> = (props:Props):JSX.Element => {

  const { pageId } = props;
  const { mutate } = useSWRxPageComment(pageId);

  return (
    <CommentEditor
      replyTo={undefined}
      onCommentButtonClicked={mutate}
      isForNewComment
    />
  );
};

export default CommentEditorLazyRenderer;
