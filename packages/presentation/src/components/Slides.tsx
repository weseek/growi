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

const marpSlide = new Marp({
  container: [
    new Element('div', { class: MARP_CONTAINER_CLASS_NAME }),
    new Element('div', { class: 'slides' }),
  ],
  inlineSVG: true,
  emoji: undefined,
  html: false,
  math: false,
});

marpSlide.themeSet.default = marpSlide.themeSet.add(`
    /*!
    * @theme growi_slide_preview
    */
    svg[data-marpit-svg] {
      box-shadow: 0 5px 10px rgb(0 0 0 / 25%);
      display: block;
      margin: 20px;
    }
    h1 {
      color: #7cf;
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
    const { html, css } = marpSlide.render(children ?? '');
    return (
      <>
        <Head>
          <style>{css}</style>
        </Head>
        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            // DOMpurify.sanitize delete elements in <svg> so sanitize is not used here.
            __html: html,
          }}
        />
      </>
    );
  }


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
