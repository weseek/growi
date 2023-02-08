import React from 'react';

import { Deck, MarkdownSlideSet } from 'spectacle';

type PresentationProps = {
  markdown: string,
}

const theme = {
  colors: {
    tertiary: 'var(--bgcolor-global)',
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
  },
};

export const Presentation = (props: PresentationProps): JSX.Element => {
  const { markdown } = props;
  return (
    <Deck theme={theme}>
      <MarkdownSlideSet>{markdown}</MarkdownSlideSet>
    </Deck>
  );
};
