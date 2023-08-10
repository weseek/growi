import React, { useEffect, useState } from 'react';

import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import Reveal from 'reveal.js';
import { unified } from 'unified';

import type { PresentationOptions } from '../consts';

import { MARP_CONTAINER_CLASS_NAME, Slides } from './Slides';

import 'reveal.js/dist/reveal.css';
import './Presentation.global.scss';

import styles from './Presentation.module.scss';


const baseRevealOptions: Reveal.Options = {
  // adjust size to the marp preset size
  width: 1280,
  height: 720,
  maxScale: 1.2,
  slideNumber: 'c/t',
};

/**
 * Remove all [hidden] in order to activate transitions
 *   cz: All of .past and .future elements are hidden by `display: none !important`
 * @see https://getbootstrap.com/docs/4.6/content/reboot/#html5-hidden-attribute
 */
const removeAllHiddenElements = () => {
  const sections = document.querySelectorAll('.grw-presentation section');
  sections.forEach(section => section.removeAttribute('hidden'));
};

export type PresentationProps = {
  options: PresentationOptions,
  isEnabledMarp: boolean,
  children?: string,
}

export const Presentation = (props: PresentationProps): JSX.Element => {
  const { options, isEnabledMarp, children } = props;
  const { revealOptions } = options;

  const [marp, setMarp] = useState<boolean>(false);

  useEffect(() => {
    let deck: Reveal.Api;
    if (children != null) {
      deck = new Reveal({ ...baseRevealOptions, ...revealOptions });
      deck.initialize()
        .then(() => deck.slide(0)); // navigate to the first slide

      deck.on('ready', removeAllHiddenElements);
      deck.on('slidechanged', removeAllHiddenElements);
    }

    setMarp(false);
    if (isEnabledMarp) {
      unified()
        .use(remarkParse)
        .use(remarkStringify)
        .use(remarkFrontmatter, ['yaml'])
        .use(() => (obj) => {
          if (obj.children[0]?.type === 'yaml') {
            const lines = (obj.children[0]?.value as string).split('\n');
            lines.forEach((line) => {
              const [key, value] = line.split(':').map(part => part.trim());
              if (key === 'marp' && value === 'true') {
                setMarp(true);
              }
            });
          }
        })
        .process(children as string);
    }

    return function cleanup() {
      deck?.off('ready', removeAllHiddenElements);
      deck?.off('slidechanged', removeAllHiddenElements);
    };
  }, [children, revealOptions, isEnabledMarp, setMarp]);

  return (
    <div className={`grw-presentation ${styles['grw-presentation']} reveal ${MARP_CONTAINER_CLASS_NAME}`}>
      <div className="slides">
        <Slides options={options} hasMarpFlag={marp}>{children}</Slides>
      </div>
    </div>
  );
};
