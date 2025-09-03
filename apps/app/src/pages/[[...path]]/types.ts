import type { CommonEachProps } from '../common-props';

export type PageEachProps = {
  redirectFrom?: string;

  isIdenticalPathPage: boolean,

  templateTagData?: string[],
  templateBodyData?: string,
};

export type EachProps = CommonEachProps & PageEachProps;
