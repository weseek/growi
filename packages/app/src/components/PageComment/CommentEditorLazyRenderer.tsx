import React from 'react';

import { useCurrentPageId } from '~/stores/context';
import { useCommentPreviewOptions } from '~/stores/renderer';

import { useSWRxPageComment } from '../../stores/comment';

import { CommentEditor } from './CommentEditor';

export const CommentEditorLazyRenderer = (): JSX.Element => {

  const { data: pageId } = useCurrentPageId();
  const { mutate } = useSWRxPageComment(pageId);
  const { data: rendererOptions } = useCommentPreviewOptions();

  if (rendererOptions == null) {
    return <></>;
  }

  return (
    <CommentEditor
      rendererOptions={rendererOptions}
      replyTo={undefined}
      onCommentButtonClicked={mutate}
      isForNewComment
    />
  );
};
