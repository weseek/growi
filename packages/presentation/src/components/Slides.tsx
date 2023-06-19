import React from 'react';

import { Marp } from '@marp-team/marp-core';
import { Element } from '@marp-team/marpit';
import Head from 'next/head';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

import type { PresentationOptions } from '../consts';
import * as extractSections from '../services/renderer/extract-sections';

import './Slides.global.scss';
import { string } from 'yargs';

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

const marpDefaultTheme = marp.themeSet.default;
const marpSlideTheme = marp.themeSet.add(`
    /*!
     * @theme slide_preview
     */
    section {
      max-width: 90%;
    }
`);


type Props = {
  options: PresentationOptions,
  children?: string,
  slideStyle?: 'true' | 'marp' | null,
}

export const Slides = (props: Props): JSX.Element => {
  const { options, children, slideStyle } = props;
  const {
    rendererOptions, isDarkMode, disableSeparationByHeader,
  } = options;

  rendererOptions.remarkPlugins?.push([
    extractSections.remarkPlugin,
    {
      isDarkMode,
      disableSeparationByHeader,
    },
  ]);


  if (slideStyle === 'true') {
    marp.themeSet.default = marpSlideTheme;
    const { css } = marp.render('', { htmlAsArray: true });
    return (
      <>
        <Head>
          <style>{css}</style>
        </Head>
        <div className={`${MARP_CONTAINER_CLASS_NAME}`}>
          <div className="slides">
            <ReactMarkdown {...rendererOptions}>
              { children ?? '## No Contents' }
            </ReactMarkdown>
          </div>
        </div>
      </>
    );
  }

  if (slideStyle === 'marp') {
    return (
      <></>
    );
  }


  marp.themeSet.default = marpDefaultTheme;
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
