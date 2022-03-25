import React, { FC } from 'react';

import { useSWRxPageComment } from '../../stores/comment';

import AppContainer from '~/client/services/AppContainer';

import CommentEditor from './CommentEditor';

type Props = {
  appContainer: AppContainer,
  pageId: string,
}

const CommentEditorLazyRenderer:FC<Props> = (props:Props):JSX.Element => {

  const { pageId } = props;
  const { mutate } = useSWRxPageComment(pageId);

  const { appContainer } = props;
  const growiRenderer = appContainer.getRenderer('comment');

  return (
    <CommentEditor
      appContainer={appContainer}
      growiRenderer={growiRenderer}
      replyTo={undefined}
      onCommentButtonClicked={mutate}
      isForNewComment
    />
  );
};

export default CommentEditorLazyRenderer;
