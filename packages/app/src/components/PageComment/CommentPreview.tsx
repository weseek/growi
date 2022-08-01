import { useCommentPreviewOptions } from '~/stores/renderer';

import RevisionRenderer from '../Page/RevisionRenderer';

type CommentPreviewPorps = {
  markdown: string,
  path: string,
}

export const CommentPreview = (props: CommentPreviewPorps): JSX.Element => {
  const { markdown, path } = props;

  const { data: commentPreviewOptions } = useCommentPreviewOptions();

  if (commentPreviewOptions == null) {
    return <></>;
  }

  return (
    <div className="page-comment-preview-body">
      <RevisionRenderer
        rendererOptions={commentPreviewOptions}
        markdown={markdown}
        additionalClassName="comment"
        pagePath={path}
      />
    </div>
  );

};
