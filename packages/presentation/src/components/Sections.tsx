import React from 'react';

import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';
import Head from 'next/head';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import * as hrSplitter from '../services/renderer/hr-splitter';


export const CONTAINER_CLASS_NAME = 'marpit';

type SectionsProps = {
  rendererOptions: ReactMarkdownOptions,
  children?: string,
}

export const Sections = (props: SectionsProps): JSX.Element => {
  const { rendererOptions, children } = props;

  rendererOptions.remarkPlugins?.push(hrSplitter.remarkPlugin);

  const marp = new Marp({
    container: [
      new Element('div', { class: CONTAINER_CLASS_NAME }),
      new Element('div', { class: 'slides' }),
    ],
    inlineSVG: false,
    emoji: undefined,
    html: false,
    math: false,
  });
  const { css } = marp.render('', { htmlAsArray: true });

  return (
    <>
      <Head>
        <style>{css}</style>
      </Head>
      <ReactMarkdown {...rendererOptions}>
        { children ?? '## No Contents' }
      </ReactMarkdown>
    </>
  );
};
