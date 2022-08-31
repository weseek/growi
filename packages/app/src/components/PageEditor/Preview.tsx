import React, {
  SyntheticEvent, RefObject,
} from 'react';

import ReactMarkdown from 'react-markdown';


import { RendererOptions } from '~/services/renderer/renderer';
import { useEditorSettings } from '~/stores/editor';

import RevisionBody from '../Page/RevisionBody';


type Props = {
  rendererOptions: RendererOptions,
  markdown?: string,
  pagePath?: string,
  renderMathJaxOnInit?: boolean,
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
      <ReactMarkdown {...rendererOptions} className='wiki'>{markdown || ''}</ReactMarkdown>
    </div>
  );

});

Preview.displayName = 'Preview';

export default Preview;
