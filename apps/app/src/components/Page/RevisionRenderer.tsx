import React from 'react';

// import mediumZoom from 'medium-zoom';

import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ReactMarkdown from 'react-markdown';

import type { RendererOptions } from '~/interfaces/renderer-options';
import loggerFactory from '~/utils/logger';

import { ImageZoom } from './ImageZoom';
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
  const classOfImage = `.${className} img`;

  // ここにimgタグに適用するコンポーネントを書く
  const Image = ({ node, ...props }) => {
    return (
      <ImageZoom
        src={props.src}
        alt={props.alt}
        options={{ background: 'black' }}
      />
    );
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ReactMarkdown
        {...rendererOptions}
        className={className}
        components={{
          img: Image,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </ErrorBoundary>
  );

});
RevisionRenderer.displayName = 'RevisionRenderer';

export default RevisionRenderer;
