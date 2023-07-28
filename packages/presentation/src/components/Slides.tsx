import React from 'react';

import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';
import Head from 'next/head';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

import type { PresentationOptions } from '../consts';
import * as extractSections from '../services/renderer/extract-sections';

import './Slides.global.scss';

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

// TODO: to change better slide style
// https://redmine.weseek.co.jp/issues/125680
const marpSlideTheme = marp.themeSet.add(`
    /*!
     * @theme slide_preview
     */
    section {
      max-width: 90%;
    }
`);
marp.themeSet.default = marpSlideTheme;


type Props = {
  options: PresentationOptions,
  children?: string,
  hasMarpFlag?: boolean,
}

export const Slides = (props: Props): JSX.Element => {
  const { options, children, hasMarpFlag } = props;
  const {
    rendererOptions, isDarkMode, disableSeparationByHeader,
  } = options;


  // TODO: can Marp rendering
  // https://redmine.weseek.co.jp/issues/115673
  if (hasMarpFlag) {
    return (
      <></>
    );
  }

  rendererOptions.remarkPlugins?.push([
    extractSections.remarkPlugin,
    {
      isDarkMode,
      disableSeparationByHeader,
    },
  ]);

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
