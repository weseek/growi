import {
  useCallback, useState,
  type FocusEventHandler, type FocusEvent,
} from 'react';

type Props = {
  range: Range,
  onSubmit?: (comment: string) => void,
  onBlur?: FocusEventHandler<HTMLDivElement>,
}

export const TextSelectionTools = (props: Props): JSX.Element | null => {
  const { onSubmit, onBlur } = props;

  const [input, setInput] = useState('foo');

  const hundleBlur = useCallback((e: FocusEvent<HTMLDivElement>) => {
    // fire onBlur only when the focus event has invoked from children
    if (!e.currentTarget?.contains(e.relatedTarget)) {
      onBlur?.(e);
    }
  }, [onBlur]);

  const submitHandler = useCallback(() => {
    onSubmit?.(input);
  }, [input, onSubmit]);

  return (
    <form onSubmit={submitHandler}>
      <div className="card" onBlur={hundleBlur}>
        <div className="card-body d-flex gap-1 py-1 px-3">
          <input
            type="text"
            className="form-control form-control-sm border-0"
            autoFocus
            placeholder="Input comment.."
            aria-describedby="inlineComment"
          />
          <button type="button" className="btn btn-sm btn-muted">
            <span className="material-symbols-outlined">alternate_email</span>
          </button>
          <button type="button" className="btn btn-sm btn-muted" onClick={submitHandler}>
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </form>
  );
};
