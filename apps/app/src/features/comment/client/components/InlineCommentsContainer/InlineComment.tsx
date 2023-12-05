import type { IInlineComment } from '@growi/core';

type Props = {
  inlineComment: IInlineComment;
}

export const InlineComment = (props: Props): JSX.Element => {
  const { inlineComment } = props;

  return (
    <span>foo</span>
  );
};
