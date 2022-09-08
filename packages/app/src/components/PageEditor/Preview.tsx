import React, {
  SyntheticEvent, RefObject,
} from 'react';

import { RendererOptions } from '~/services/renderer/renderer';
import { useEditorSettings } from '~/stores/editor';

import RevisionRenderer from '../Page/RevisionRenderer';


type Props = {
  rendererOptions: RendererOptions,
  markdown?: string,
  pagePath?: string | null,
  onScroll?: (scrollTop: number) => void,
}

const Preview = React.forwardRef((props: Props, ref: RefObject<HTMLDivElement>): JSX.Element => {

  const {
    rendererOptions,
    markdown, pagePath,
  } = props;

  const { data: editorSettings } = useEditorSettings();


  return (
    <div
      className="page-editor-preview-body"
      ref={ref}
      onScroll={(event: SyntheticEvent<HTMLDivElement>) => {
        if (props.onScroll != null) {
          props.onScroll(event.currentTarget.scrollTop);
        }
      }}
    >
      { markdown != null && (
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown}></RevisionRenderer>
      ) }
    </div>
  );

});

Preview.displayName = 'Preview';

export default Preview;
