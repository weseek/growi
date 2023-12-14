import React, {
  useCallback, useRef, useEffect,
} from 'react';

type Props = {
  searchKeyword: string,
  onChangeSearchText?: (text: string) => void,
  onClickClearButton?: () => void,
  getInputProps: any
}
export const SearchForm = (props: Props): JSX.Element => {
  const {
    searchKeyword, onChangeSearchText, onClickClearButton, getInputProps,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const changeSearchTextHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeSearchText != null) {
      onChangeSearchText(e.target.value);
    }
  }, [onChangeSearchText]);

  const clickClearButtonHandler = useCallback(() => {
    if (onClickClearButton != null) {
      onClickClearButton();
    }
  }, [onClickClearButton]);

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.focus();
    }
  });

  return (
    <div className="text-muted d-flex justify-content-center align-items-center">
      <span className="material-symbols-outlined fs-4 me-3">search</span>

      <input
        {...getInputProps({
          ref: inputRef,
          type: 'text',
          placeholder: 'Search...',
          value: searchKeyword,
        })}
        className="form-control"
        onChange={changeSearchTextHandler}
      />

      <button
        type="button"
        className="btn border-0 d-flex justify-content-center p-0"
        onClick={clickClearButtonHandler}
      >
        <span className="material-symbols-outlined fs-4 ms-3">close</span>
      </button>
    </div>
  );
};
