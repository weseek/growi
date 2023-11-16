import { useCallback, useState } from 'react';

type Props = {
  range: Range,
  onExit?: () => void,
}

export const InlineCommentForm = (props: Props): JSX.Element => {
  const { range, onExit } = props;

  const [input, setInput] = useState('');

  const submitHandler = useCallback(() => {
    console.log({ input, range });
    onExit?.();
  }, [input, range, onExit]);

  return (
    <form onSubmit={submitHandler}>
      <div className="d-flex gap-1">
        <input
          type="text"
          className="form-control form-control-sm border-0"
          autoFocus
          placeholder="Input comment.."
          onChange={e => setInput(e.target.value)}
          aria-describedby="inlineComment"
        />
        <button type="button" className="btn btn-sm btn-muted">
          <span className="material-symbols-outlined">alternate_email</span>
        </button>
        <button type="button" className="btn btn-sm btn-muted" onClick={submitHandler}>
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </form>
  );
};
