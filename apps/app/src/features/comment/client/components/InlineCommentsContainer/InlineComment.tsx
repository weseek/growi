import type { IComment } from '~/interfaces/comment';

type Props = {
  inlineComment: IComment;
}

export const InlineComment = (props: Props): JSX.Element => {
  const { inlineComment } = props;

  return (
    <span>foo</span>
  );
};
