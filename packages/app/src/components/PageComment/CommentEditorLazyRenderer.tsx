import React, { FC } from 'react';

import { useCommentPreviewOptions } from '~/stores/renderer';

import { useSWRxPageComment } from '../../stores/comment';

import { CommentEditor } from './CommentEditor';

type Props = {
  pageId: string,
}

const CommentEditorLazyRenderer:FC<Props> = (props:Props):JSX.Element => {

  const { pageId } = props;
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

export default CommentEditorLazyRenderer;
