import React, { useEffect } from 'react';

import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import Reveal from 'reveal.js';

import { MARP_CONTAINER_CLASS_NAME, Sections } from './Sections';

import 'reveal.js/dist/reveal.css';
import './Presentation.global.scss';

import styles from './Presentation.module.scss';


const baseRevealOptions: Reveal.Options = {
  disableLayout: true,
};

type Props = {
  rendererOptions: ReactMarkdownOptions,
  revealOptions?: Reveal.Options,
  children?: string,
}

export const Presentation = (props: Props): JSX.Element => {
  const { rendererOptions, revealOptions, children } = props;

  useEffect(() => {
    if (children != null) {
      const deck = new Reveal({ ...baseRevealOptions, ...revealOptions });
      deck.initialize()
        .then(() => deck.slide(0)); // navigate to the first slide
    }
  }, [children, revealOptions]);

  return (
    <div className={`grw-presentation ${styles['grw-presentation']} reveal ${MARP_CONTAINER_CLASS_NAME}`}>
      <div className="slides d-flex justify-content-center align-items-center">
        <Sections rendererOptions={rendererOptions}>{children}</Sections>
      </div>
    </div>
  );
};
