import { useCommentPreviewOptions } from '~/stores/renderer';

import RevisionRenderer from '../Page/RevisionRenderer';


import styles from './CommentPreview.module.scss';


type CommentPreviewPorps = {
  markdown: string,
}

export const CommentPreview = (props: CommentPreviewPorps): JSX.Element => {

  const { markdown } = props;

  const { data: rendererOptions } = useCommentPreviewOptions();

  if (rendererOptions == null) {
    return <></>;
  }

  return (
    <div className={`grw-comment-preview ${styles['grw-comment-preview']}`}>
      <RevisionRenderer
        rendererOptions={rendererOptions}
        markdown={markdown}
        additionalClassName="comment"
      />
    </div>
  );

};
