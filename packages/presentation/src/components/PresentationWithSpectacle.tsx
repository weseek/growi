import React from 'react';

import {
  Deck, Slide, FlexBox, Box, FullScreen, Progress, MarkdownSlideSet,
} from 'spectacle';

type Props = {
  children?: string,
}

const theme = {
  colors: {
    tertiary: 'var(--bgcolor-global)',
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
  },
};

const template = ({ slideNumber, numberOfSlides }) => (
  <FlexBox
    justifyContent="space-between"
    position="absolute"
    bottom={0}
    width={1}
  >
    <Box padding="0 1em">
      <FullScreen />
    </Box>
    <Box padding="1em">
      <Progress />
      {slideNumber} / {numberOfSlides}
    </Box>
  </FlexBox>
);

export const Presentation = (props: Props): JSX.Element => {
  const { children } = props;

  return (
    <Deck theme={theme} template={template}>
      { children == null
        ? <Slide>No contents</Slide>
        : <MarkdownSlideSet>{children}</MarkdownSlideSet>
      }
    </Deck>
  );
};
