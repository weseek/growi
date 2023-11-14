type Props = {
  range: Range,
}

export const TextSelectionTools = (props: Props): JSX.Element | null => {
  return (
    <div className="card">
      <div className="card-body d-flex gap-1 py-1 px-3">
        <input
          type="text"
          className="form-control form-control-sm border-0"
          placeholder="Input comment.."
          aria-describedby="inlineComment"
        />
        <button type="button" className="btn btn-sm btn-muted"><span className="material-symbols-outlined">send</span></button>
        <button type="button" className="btn btn-sm btn-muted"><span className="material-symbols-outlined">alternate_email</span></button>
      </div>
    </div>
  );
};
