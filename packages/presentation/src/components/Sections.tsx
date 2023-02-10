import React from 'react';

import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';
import Head from 'next/head';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import * as hrSplitter from '../services/renderer/hr-splitter';

import './Sections.global.scss';

export const MARP_CONTAINER_CLASS_NAME = 'marpit';


const marp = new Marp({
  container: [
    new Element('div', { class: MARP_CONTAINER_CLASS_NAME }),
    new Element('div', { class: 'slides' }),
  ],
  inlineSVG: false,
  emoji: undefined,
  html: false,
  math: false,
});


type SectionsProps = {
  rendererOptions: ReactMarkdownOptions,
  children?: string,
}

export const Sections = (props: SectionsProps): JSX.Element => {
  const { rendererOptions, children } = props;

  rendererOptions.remarkPlugins?.push(hrSplitter.remarkPlugin);

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
