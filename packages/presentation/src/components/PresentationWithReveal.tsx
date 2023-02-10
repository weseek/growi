import React, { useEffect } from 'react';

import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import Reveal from 'reveal.js';


import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';
import { Sections } from './Sections';


type Props = {
  rendererOptions: ReactMarkdownOptions,
  revealOptions?: Reveal.Options,
  children?: string,
}

export const Presentation = (props: Props): JSX.Element => {
  const { rendererOptions, revealOptions, children } = props;

  useEffect(() => {
    if (children != null) {
      const deck = new Reveal(revealOptions);
      deck.initialize()
        .then(() => deck.slide(0)); // navigate to the first slide
    }
  }, [children, revealOptions]);

  return (
    <div className="reveal">
      <div className="slides">
        <Sections rendererOptions={rendererOptions}>{children}</Sections>
      </div>
    </div>
  );
};
