import type { CommonEachProps } from '../common-props';

export type EachProps = CommonEachProps & {
  redirectFrom?: string;

  isIdenticalPathPage: boolean,

  templateTagData?: string[],
  templateBodyData?: string,
}
