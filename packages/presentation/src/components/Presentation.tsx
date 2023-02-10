import React, { useEffect } from 'react';

import Reveal from 'reveal.js';

import type { PresentationOptions } from '../consts';

import { MARP_CONTAINER_CLASS_NAME, Sections } from './Sections';

import 'reveal.js/dist/reveal.css';
import './Presentation.global.scss';

import styles from './Presentation.module.scss';


const baseRevealOptions: Reveal.Options = {
  disableLayout: true,
  slideNumber: 'c/t',
};

export type PresentationProps = {
  options: PresentationOptions,
  children?: string,
}

export const Presentation = (props: PresentationProps): JSX.Element => {
  const { options, children } = props;
  const { revealOptions } = options;

  useEffect(() => {
    if (children != null) {
      const deck = new Reveal({ ...baseRevealOptions, ...revealOptions });
      deck.initialize()
        .then(() => deck.slide(0)); // navigate to the first slide
    }

    return function cleanup() {
      Reveal?.destroy?.();
    };
  }, [children, revealOptions]);

  return (
    <div className={`grw-presentation ${styles['grw-presentation']} reveal ${MARP_CONTAINER_CLASS_NAME}`}>
      <div className="slides d-flex justify-content-center align-items-center">
        <Sections options={options}>{children}</Sections>
      </div>
    </div>
  );
};
