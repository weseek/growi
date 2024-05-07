import { parseSlideFrontmatterInMarkdown } from '@growi/presentation';

import type { RendererOptions } from '~/interfaces/renderer-options';
import { useIsEnabledMarp } from '~/stores/context';

import { SlideViewer } from '../SlideViewer';

import RevisionRenderer from './RevisionRenderer';

type ViewRendererProps = {
  rendererOptions: RendererOptions,
  markdown: string
};

export const ViewRenderer = (props: ViewRendererProps): JSX.Element => {

  const { rendererOptions, markdown } = props;

  const { data: enabledMarp } = useIsEnabledMarp();

  const [marp, useSlide] = parseSlideFrontmatterInMarkdown(markdown);
  const useMarp = (enabledMarp ?? false) && marp;

  return (
    (useMarp || useSlide)
      ? (<SlideViewer marp={useMarp}>{markdown}</SlideViewer>)
      : (<RevisionRenderer rendererOptions={rendererOptions} markdown={markdown} />)
  );
};
