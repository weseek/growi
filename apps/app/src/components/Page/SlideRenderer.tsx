import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

import { useIsEnabledMarp } from '~/stores/context';
import { usePresentationViewOptions } from '~/stores/renderer';

import { Slides } from '../Presentation/Slides';

type SlideRendererProps = {
  markdown: string,
  marp?: boolean,
};

export const SlideRenderer = (props: SlideRendererProps): JSX.Element => {

  const { markdown, marp = false } = props;
  const { data: enabledMarp = false } = useIsEnabledMarp();

  const { data: rendererOptions } = usePresentationViewOptions();

  return (
    <Slides
      hasMarpFlag={enabledMarp && marp}
      options={{ rendererOptions: rendererOptions as ReactMarkdownOptions }}
    >
      {markdown}
    </Slides>
  );
};
