import React, {
  useCallback, useRef, useEffect, useMemo,
} from 'react';

import { GetInputProps } from '../interfaces/downshift';

type Props = {
  searchKeyword: string,
  highlightedIndex: number | null,
  onChangeSearchText?: (text: string) => void,
  onEnterKeyDownHandler?: () => void,
  getInputProps: GetInputProps,
}

export const SearchForm = (props: Props): JSX.Element => {
  const {
    searchKeyword, highlightedIndex, onChangeSearchText, onEnterKeyDownHandler, getInputProps,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const changeSearchTextHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeSearchText != null) {
      onChangeSearchText(e.target.value);
    }
  }, [onChangeSearchText]);

  const keyDownHandler = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const shouldExecuteEnterKeyDownHandler = e.key === 'Enter'
    && !e.nativeEvent.isComposing // see: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing
    && highlightedIndex == null
    && searchKeyword.trim().length !== 0;

    if (shouldExecuteEnterKeyDownHandler) {
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
      onKeyDown: keyDownHandler,
    });
  }, [getInputProps, searchKeyword, changeSearchTextHandler, keyDownHandler]);

  useEffect(() => {
    if (inputRef.current != null) {
      inputRef.current.focus();
    }
  });

  return (
    <input {...inputOptions} />
  );
};
