import React from 'react';

import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import * as hrSplitter from '../services/renderer/hr-splitter';

type Props = {
  rendererOptions: ReactMarkdownOptions,
  children?: string,
}

export const Presentation = (props: Props): JSX.Element => {
  const { rendererOptions, children } = props;

  rendererOptions.remarkPlugins?.push(hrSplitter.remarkPlugin);

  return (
    <>
      { children == null
        ? <section>No contents</section>
        : <ReactMarkdown {...rendererOptions}>{children}</ReactMarkdown>
      }
    </>
  );
};
