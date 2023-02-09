import React, { useEffect } from 'react';

import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import Reveal from 'reveal.js';

import * as hrSplitter from '../services/renderer/hr-splitter';


type Props = {
  rendererOptions: ReactMarkdownOptions,
  children?: string,
}

export const Presentation = (props: Props): JSX.Element => {
  const { rendererOptions, children } = props;

  useEffect(() => {
    if (children != null) {
      Reveal.initialize({
        hash: true,
        pageNumber: true,
      });
    }
  }, [children]);

  rendererOptions.remarkPlugins?.push(hrSplitter.remarkPlugin);

  return (
    <div className="reveal">
      <div className="slides">
        { children == null
          ? <section>No contents</section>
          : <ReactMarkdown {...rendererOptions}>{children}</ReactMarkdown>
        }
      </div>
    </div>
  );
};
