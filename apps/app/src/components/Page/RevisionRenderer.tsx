import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ReactMarkdown from 'react-markdown';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';


import type { RendererOptions } from '~/interfaces/renderer-options';
import loggerFactory from '~/utils/logger';

import 'katex/dist/katex.min.css';


const logger = loggerFactory('components:Page:RevisionRenderer');


type Props = {
  rendererOptions: RendererOptions,
  markdown: string,
  additionalClassName?: string,
  isSlidesOverviewEnabled?: boolean,
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

const RevisionSlidePreview = dynamic(() => import('./RevisionSlidePreview').then(mod => mod.RevisionSlidePreview), { ssr: false });

const RevisionRenderer = React.memo((props: Props): JSX.Element => {

  const {
    rendererOptions, markdown, additionalClassName, isSlidesOverviewEnabled,
  } = props;

  type presentationSlideStyle = 'marp' | 'true' | null;
  const [slideStyle, setSlideStyle] = useState<presentationSlideStyle>(null);

  useEffect(() => {
    unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter, ['yaml'])
      .use(() => (obj) => {
        setSlideStyle(null);
        if (obj.children[0]?.type === 'yaml') {
          for (const line of obj.children[0]?.value.split('\n')) {
            // obj.children[0].value is "presentation:true\ntitle: hoge\nclass: fuga" etc..
            // applay last presentation style in frontmatter
            const parts = line.split(':');
            if (parts.length !== 2) {
              continue;
            }
            const key = parts[0].trim();
            const value = parts[1].trim();
            if (key === 'presentation') {
              setSlideStyle(
                value === 'marp' || value === 'true' ? value : null,
              );
            }
            else if (key === 'marp' && value === 'true') {
              setSlideStyle('marp');
            }
          }
        }
      })
      .process(markdown);
  }, [markdown, setSlideStyle]);

  //  if (isSlidesOverviewEnabled && marp) {
  if (slideStyle === 'true' || slideStyle === 'marp') {
    return (
      <RevisionSlidePreview
        rendererOptions = {rendererOptions}
        markdown = {markdown}
        slideStyle = {slideStyle}
      />
    );
  }
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
