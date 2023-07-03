import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import ReactMarkdown from 'react-markdown';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';


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

const Slides = dynamic(() => import('@growi/presentation').then(mod => mod.Slides), { ssr: false });

const RevisionRenderer = React.memo((props: Props): JSX.Element => {

  const {
    rendererOptions, markdown, additionalClassName, isSlidesOverviewEnabled,
  } = props;

  const [hasSlideFlag, setHasSlideFlag] = useState<boolean>();
  const [hasMarpFlag, setHasMarpFlag] = useState<boolean>();

  // useEffect avoid ssr
  useEffect(() => {
    if (isSlidesOverviewEnabled) {
      const processMarkdown = () => (tree) => {
        setHasSlideFlag(false);
        setHasMarpFlag(false);
        visit(tree, 'yaml', (node) => {
          if (node.value != null) {
            const lines = node.value.split('\n');

            lines.forEach((line) => {
              const [key, value] = line.split(':').map(part => part.trim());

              if (key === 'slide' && value === 'true') {
                setHasSlideFlag(true);
              }
              else if (key === 'marp' && value === 'true') {
                setHasMarpFlag(true);
              }
            });
          }
        });
      };

      unified()
        .use(remarkParse)
        .use(remarkStringify)
        .use(remarkFrontmatter, ['yaml'])
        .use(processMarkdown)
        .process(markdown);
    }
  }, [markdown, setHasSlideFlag, setHasMarpFlag, isSlidesOverviewEnabled]);

  if (isSlidesOverviewEnabled && (hasSlideFlag || hasMarpFlag)) {
    const options = {
      rendererOptions: rendererOptions as ReactMarkdownOptions,
      isDarkMode: false,
      disableSeparationsByHeader: false,
    };
    return (
      <Slides
        options={options}
        hasMarpFlag={hasMarpFlag}
      >{markdown}</Slides>
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
