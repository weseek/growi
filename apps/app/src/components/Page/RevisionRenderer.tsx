import React, { useState } from 'react';

import FsLightbox from 'fslightbox-react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ReactMarkdown from 'react-markdown';

import type { RendererOptions } from '~/interfaces/renderer-options';
import loggerFactory from '~/utils/logger';

import 'katex/dist/katex.min.css';

const logger = loggerFactory('components:Page:RevisionRenderer');

type Props = {
  rendererOptions: RendererOptions,
  markdown: string,
  additionalClassName?: string,
}

const ErrorFallback: React.FC<FallbackProps> = React.memo(({ error, resetErrorBoundary }) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button className='btn btn-primary' onClick={resetErrorBoundary}>Reload</button>
    </div>
  );
});
ErrorFallback.displayName = 'ErrorFallback';

const RevisionRenderer = React.memo((props: Props): JSX.Element => {

  const {
    rendererOptions, markdown, additionalClassName,
  } = props;

  const className = `wiki ${additionalClassName ?? ''}`;

  const LightBoxImage = ({ node, ...props }) => {
    const [toggler, setToggler] = useState(false);
    return (
      <>
        <img src={props.src} alt={props.alt} onClick={() => setToggler(!toggler)}/>
        <FsLightbox
          toggler={toggler}
          sources={[props.src]}
        />
      </>
    );
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ReactMarkdown
        {...rendererOptions}
        className={className}
        components={{
          img: LightBoxImage,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </ErrorBoundary>
  );

});
RevisionRenderer.displayName = 'RevisionRenderer';

export default RevisionRenderer;
