import React, {
  useCallback, useRef, useEffect,
} from 'react';

type Props = {
  searchKeyword: string,
  onChangeSearchText?: (text: string) => void,
  onClickClearButton?: () => void,
}
export const SearchForm = (props: Props): JSX.Element => {
  const {
    searchKeyword, onChangeSearchText, onClickClearButton,
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
    <div className="text-muted d-flex justify-content-center align-items-center ps-1">
      <span className="material-symbols-outlined fs-4 me-3">search</span>

      <input
        ref={inputRef}
        type="text"
        className="form-control"
        placeholder="Search..."
        value={searchKeyword}
        onChange={(e) => { changeSearchTextHandler(e) }}
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
