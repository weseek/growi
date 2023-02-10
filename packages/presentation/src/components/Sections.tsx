import React from 'react';

// import { Marp } from '@marp-team/marp-core';
import Head from 'next/head';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import * as hrSplitter from '../services/renderer/hr-splitter';

type SectionsProps = {
  rendererOptions: ReactMarkdownOptions,
  children?: string,
}

export const Sections = (props: SectionsProps): JSX.Element => {
  const { rendererOptions, children } = props;

  rendererOptions.remarkPlugins?.push(hrSplitter.remarkPlugin);

  // const marp = new Marp();
  // const { css } = marp.render('', { htmlAsArray: true });
  return (
    <>
      <Head>
        {/* <style>{css}</style> */}
      </Head>
      { children == null
        ? <section>No contents</section>
        : <ReactMarkdown {...rendererOptions}>{children}</ReactMarkdown>
      }
    </>
  );
};
