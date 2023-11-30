import React, { useCallback, forwardRef } from 'react';

type Props = {
  searchText: string,
  onChangeSearchText?: (text: string) => void,
  onClickClearButton?: () => void,
}
export const SearchForm = forwardRef<HTMLInputElement, Props>((props, ref): JSX.Element => {
  const {
    searchText, onChangeSearchText, onClickClearButton,
  } = props;

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

  return (
    <div className="text-muted d-flex justify-content-center align-items-center ps-1">
      <span className="material-symbols-outlined fs-4 me-3">search</span>

      <input
        ref={ref}
        className="form-control"
        placeholder="Search..."
        value={searchText}
        onChange={(Element) => { changeSearchTextHandler(Element) }}
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
});
