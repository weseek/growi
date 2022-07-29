import React from 'react';

import { useCurrentPageId } from '~/stores/context';

import { useSWRxPageComment } from '../../stores/comment';

import { CommentEditor } from './CommentEditor';


export const CommentEditorLazyRenderer = (): JSX.Element => {

  const { data: pageId } = useCurrentPageId();
  const { mutate } = useSWRxPageComment(pageId);

  return (
    <CommentEditor
      replyTo={undefined}
      onCommentButtonClicked={mutate}
      isForNewComment
    />
  );
};
