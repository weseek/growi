import React, { FC } from 'react';

import { useSWRxPageComment } from '../../stores/comment';

import AppContainer from '~/client/services/AppContainer';

import CommentEditor from './CommentEditor';
import { useCommentPreviewOptions } from '~/stores/renderer';

type Props = {
  appContainer: AppContainer,
  pageId: string,
}

const CommentEditorLazyRenderer:FC<Props> = (props:Props):JSX.Element => {

  const { pageId } = props;
  const { mutate } = useSWRxPageComment(pageId);
  const { data: commentPreviewOptions } = useCommentPreviewOptions();

  if (commentPreviewOptions == null) {
    return <></>;
  }

  const { appContainer } = props;

  return (
    <CommentEditor
      appContainer={appContainer}
      rendererOptions={commentPreviewOptions}
      replyTo={undefined}
      onCommentButtonClicked={mutate}
      isForNewComment
    />
  );
};

export default CommentEditorLazyRenderer;
