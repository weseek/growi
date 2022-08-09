import React from 'react';

import dynamic from 'next/dynamic';

import { RendererOptions } from '~/services/renderer/renderer';

import { useSWRxPageComment } from '../../stores/comment';

import { CommentEditorProps } from './CommentEditor';

// TODO: Update Skelton
const CommentEditor = dynamic<CommentEditorProps>(() => import('./CommentEditor').then(mod => mod.CommentEditor), { ssr: false });


type Props = {
  pageId?: string,
  rendererOptions: RendererOptions,
}

export const CommentEditorLazyRenderer = (props: Props): JSX.Element => {

  const { pageId, rendererOptions } = props;

  const { mutate } = useSWRxPageComment(pageId);

  return (
    <CommentEditor
      rendererOptions={rendererOptions}
      isForNewComment
      replyTo={undefined}
      onCommentButtonClicked={mutate}
    />
  );

};
