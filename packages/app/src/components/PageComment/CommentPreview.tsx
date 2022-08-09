import { RendererOptions } from '~/services/renderer/renderer';

import RevisionRenderer from '../Page/RevisionRenderer';


type CommentPreviewPorps = {
  rendererOptions: RendererOptions,
  markdown: string,
  path: string,
}

export const CommentPreview = (props: CommentPreviewPorps): JSX.Element => {

  const { rendererOptions, markdown, path } = props;

  return (
    <div className="page-comment-preview-body">
      <RevisionRenderer
        rendererOptions={rendererOptions}
        markdown={markdown}
        additionalClassName="comment"
        pagePath={path}
      />
    </div>
  );

};
