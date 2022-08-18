import React from 'react';

import dynamic from 'next/dynamic';

import { RendererOptions } from '~/services/renderer/renderer';

import { useSWRxPageComment } from '../../stores/comment';
import { Skelton } from '../Skelton';

import { CommentEditorProps } from './CommentEditor';

import styles from '../PageComment.module.scss';
import CommentEditorStyles from './CommentEditor.module.scss';

const CommentEditor = dynamic<CommentEditorProps>(() => import('./CommentEditor').then(mod => mod.CommentEditor),
  {
    ssr: false,
    loading: () => <div className={`${CommentEditorStyles['comment-editor-styles']} form page-comment-form`}>
      <div className='comment-form'>
        <div className='comment-form-user'>
          <Skelton additionalClass='rounded-circle picture' roundedPill />
        </div>
        <Skelton additionalClass="page-comment-commenteditorlazyrenderer-body-skelton grw-skelton" />
      </div>
    </div>,
  });

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
