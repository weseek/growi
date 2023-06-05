import React, { useEffect, useState } from 'react';

import { MARP_CONTAINER_CLASS_NAME, Slides } from '@growi/presentation';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ReactMarkdown from 'react-markdown';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
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

const RevisionRenderer = React.memo((props: Props): JSX.Element => {

  const {
    rendererOptions, markdown, additionalClassName, isSlidesOverviewEnabled,
  } = props;

  type presentationSlideStyle = 'marp' | 'true' | null;
  const [slideStyle, setSlideStyle] = useState<presentationSlideStyle>(null);
  const [removedFrontMatterMarkdown, setRemovedFrontMatterMarkdown] = useState<string>(markdown);

  useEffect(() => {
    unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter, ['yaml'])
      .use(() => (obj) => {
        setSlideStyle(null);
        if (obj.children[0]?.type === 'yaml') {
          for (const val of obj.children[0]?.value.split('\n')) {
            // obj.children[0].value is "presentation:true\ntitle: hoge\nclass: fuga" etc..
            const value = val.split(':');
            if (value[0].trim() === 'presentation') {
              const v = value[1].trim();
              setSlideStyle(
                v === 'marp' || v === 'true' ? v : null,
              );
            }
          }
        }
      })
      .process(markdown);
  }, [markdown]);

  //  if (isSlidesOverviewEnabled && marp) {
  if (slideStyle === 'true' || slideStyle === 'marp') {
    return (
      <div>
      </div>
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
