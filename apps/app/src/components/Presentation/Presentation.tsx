import { Presentation as PresentationSubstance, type PresentationProps } from '@growi/presentation';

import { parseSlideFrontmatter } from '../Page/markdown-slide-util-for-view';

import '@growi/presentation/dist/style.css';

type Props = {
  isEnabledMarp: boolean
} & PresentationProps;

export const Presentation = (props: Props): JSX.Element => {
  const { options, isEnabledMarp, children } = props;

  const [marp] = parseSlideFrontmatter(children ?? '');
  const hasMarpFlag = isEnabledMarp && marp;

  return <PresentationSubstance options={options} hasMarpFlag={hasMarpFlag}>{children}</PresentationSubstance>;
};
