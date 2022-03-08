import React, { FC } from 'react';

import AppContainer from '~/client/services/AppContainer';

import CommentEditor from './CommentEditor';

type Props = {
  appContainer: AppContainer,
}

const CommentEditorLazyRenderer:FC<Props> = (props:Props):JSX.Element => {

  const growiRenderer = props.appContainer.getRenderer('comment');

  return (
    <CommentEditor
      growiRenderer={growiRenderer}
      replyTo={undefined}
      isForNewComment
    />
  );
};

export default CommentEditorLazyRenderer;
