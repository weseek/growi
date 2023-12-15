import React, {
  useCallback, useRef, useEffect, useMemo,
} from 'react';

import { GetInputProps } from '../interfaces/downshift';

type Props = {
  searchKeyword: string,
  highlightedIndex: number | null,
  onChangeSearchText?: (text: string) => void,
  onClickCloseModalButton?: () => void,
  onEnterKeyDownHandler?: () => void,
  getInputProps: GetInputProps,
}

export const SearchForm = (props: Props): JSX.Element => {
  const {
    searchKeyword, highlightedIndex, onChangeSearchText, onClickCloseModalButton, onEnterKeyDownHandler, getInputProps,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const changeSearchTextHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeSearchText != null) {
      onChangeSearchText(e.target.value);
    }
  }, [onChangeSearchText]);

  const clickCloseModalButtonHandler = useCallback(() => {
    onClickCloseModalButton?.();
  }, [onClickCloseModalButton]);

  const enterKeyDownHandler = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const shouldExecuteHandler = e.key === 'Enter'
    && !e.nativeEvent.isComposing // see: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing
    && highlightedIndex == null
    && searchKeyword.trim().length !== 0;

    if (shouldExecuteHandler) {
      onEnterKeyDownHandler?.();
    }
  }, [highlightedIndex, onEnterKeyDownHandler, searchKeyword]);

  const inputOptions = useMemo(() => {
    return getInputProps({
      type: 'search',
      placeholder: 'Search...',
      className: 'form-control',
      ref: inputRef,
      value: searchKeyword,
      onChange: changeSearchTextHandler,
      onKeyDown: enterKeyDownHandler,
    });
  }, [changeSearchTextHandler, enterKeyDownHandler, getInputProps, searchKeyword]);

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.focus();
    }
  });

  return (
    <div className="text-muted d-flex justify-content-center align-items-center">
      <span className="material-symbols-outlined fs-4 me-3">search</span>

      <input {...inputOptions} />

      <button
        type="button"
        className="btn border-0 d-flex justify-content-center p-0"
        onClick={clickCloseModalButtonHandler}
      >
        <span className="material-symbols-outlined fs-4 ms-3">close</span>
      </button>
    </div>
  );
};
