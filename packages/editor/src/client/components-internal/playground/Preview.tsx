type Props = {
  markdown?: string,
}

export const Preview = (props: Props): React.ReactElement => {
  return (
    <div className="container">
      <h3>Preview</h3>
      <div className="card" style={{ minHeight: '200px' }}>
        {props.markdown ?? ''}
      </div>
    </div>
  );
};
