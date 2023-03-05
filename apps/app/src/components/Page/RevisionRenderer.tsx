import React from 'react';

import ReactMarkdown from 'react-markdown';

import type { RendererOptions } from '~/interfaces/renderer-options';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('components:Page:RevisionRenderer');


type Props = {
  rendererOptions: RendererOptions,
  markdown: string,
  additionalClassName?: string,
}

const RevisionRenderer = React.memo((props: Props): JSX.Element => {

  const {
    rendererOptions, markdown, additionalClassName,
  } = props;

  return (
    <ReactMarkdown
      {...rendererOptions}
      className={`wiki ${additionalClassName ?? ''}`}
    >
      {markdown}
    </ReactMarkdown>
  );

});
RevisionRenderer.displayName = 'RevisionRenderer';

export default RevisionRenderer;
