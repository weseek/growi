import { Presentation as PresentationSubstance, type PresentationProps } from '@growi/presentation';

import { parseSlideFrontmatterInMarkdown } from '../Page/markdown-slide-util-for-view';

import '@growi/presentation/dist/style.css';

type Props = {
  isEnabledMarp: boolean
} & PresentationProps;

export const Presentation = (props: Props): JSX.Element => {
  const { options, isEnabledMarp, children } = props;

  const [marp] = parseSlideFrontmatterInMarkdown(children ?? '');
  const hasMarpFlag = isEnabledMarp && marp;

  return <PresentationSubstance options={options} hasMarpFlag={hasMarpFlag}>{children}</PresentationSubstance>;
};
