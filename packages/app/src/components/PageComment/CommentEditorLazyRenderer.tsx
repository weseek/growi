import React from 'react';

import { Nullable } from '@growi/core';

import { RendererOptions } from '~/services/renderer/renderer';

import { useSWRxPageComment } from '../../stores/comment';

import { CommentEditor } from './CommentEditor';


type Props = {
  pageId?: Nullable<string>,
  rendererOptions: RendererOptions,
}

export const CommentEditorLazyRenderer = (props: Props): JSX.Element => {

  const { pageId, rendererOptions } = props;

  const { mutate } = useSWRxPageComment(pageId);

  return (
    <CommentEditor
      rendererOptions={rendererOptions}
      replyTo={undefined}
      onCommentButtonClicked={mutate}
      isForNewComment
    />
  );
};
