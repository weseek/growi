type Props = {
  range: Range,
}

export const TextSelectionTools = (props: Props): JSX.Element | null => {
  const { range } = props;

  return (
    <>
      {range.toString().replace(/\s/g, '').length} characters
    </>
  );
};
