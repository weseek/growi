import React, { useEffect } from 'react';

import Reveal from 'reveal.js';

import type { PresentationOptions } from '../consts';

import { Slides } from './Slides';

import 'reveal.js/dist/reveal.css';
import './Presentation.global.scss';

import styles from './Presentation.module.scss';


const baseRevealOptions: Reveal.Options = {
  // adjust size to the marp preset size
  width: 1280,
  height: 720,
  maxScale: 1.2,
  slideNumber: 'c/t',
  display: '',
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
  children?: string,
}

export const Presentation = (props: PresentationProps): JSX.Element => {
  const { options, children } = props;
  const { revealOptions } = options;

  useEffect(() => {
    let deck: Reveal.Api;
    if (children != null) {
      deck = new Reveal({ ...baseRevealOptions, ...revealOptions });
      deck.initialize()
        .then(() => deck.slide(0)); // navigate to the first slide

      deck.on('ready', removeAllHiddenElements);
      deck.on('slidechanged', removeAllHiddenElements);
    }

    return function cleanup() {
      deck?.off('ready', removeAllHiddenElements);
      deck?.off('slidechanged', removeAllHiddenElements);
    };
  }, [children, revealOptions]);

  return (
    <div className={`grw-presentation ${styles['grw-presentation']} reveal`}>
      <Slides options={options} presentation>{children}</Slides>
    </div>
  );
};
