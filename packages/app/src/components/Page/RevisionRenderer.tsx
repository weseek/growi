import React from 'react';

import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ReactMarkdown from 'react-markdown-customkeyprop';

import type { RendererOptions } from '~/services/renderer/renderer';
import loggerFactory from '~/utils/logger';

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

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ReactMarkdown
        {...rendererOptions}
        className={`wiki ${additionalClassName ?? ''}`}
      >
        {markdown}
      </ReactMarkdown>
    </ErrorBoundary>
  );

});
RevisionRenderer.displayName = 'RevisionRenderer';

export default RevisionRenderer;
