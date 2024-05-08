import { parseSlideFrontmatterInMarkdown } from '@growi/presentation';

import { useIsEnabledMarp } from '~/stores/context';

import { SlideViewer } from '../SlideViewer';

type SlideRendererProps = {
  markdown: string
};

export const SlideRenderer = (props: SlideRendererProps): JSX.Element => {

  const { markdown } = props;

  const { data: enabledMarp } = useIsEnabledMarp();

  const [marp, useSlide] = parseSlideFrontmatterInMarkdown(markdown);
  const useMarp = (enabledMarp ?? false) && marp;

  return (
    (useMarp || useSlide)
      ? (<SlideViewer marp={useMarp}>{markdown}</SlideViewer>)
      : <></>
  );
};
