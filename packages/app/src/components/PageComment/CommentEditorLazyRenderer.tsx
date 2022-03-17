import React, { FC } from 'react';

import AppContainer from '~/client/services/AppContainer';

import CommentEditor from './CommentEditor';

type Props = {
  appContainer: AppContainer,
}

const CommentEditorLazyRenderer:FC<Props> = (props:Props):JSX.Element => {

  const { appContainer } = props;
  const growiRenderer = appContainer.getRenderer('comment');

  return (
    <CommentEditor
      appContainer={appContainer}
      growiRenderer={growiRenderer}
      replyTo={undefined}
      isForNewComment
    />
  );
};

export default CommentEditorLazyRenderer;
