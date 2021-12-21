import React, {
  FC, KeyboardEvent, useCallback, useReducer, useRef, useState,
} from 'react';
// eslint-disable-next-line no-restricted-imports
import { AxiosResponse } from 'axios';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';

import { apiGet } from '~/client/util/apiv1-client';
import { IPage } from '~/interfaces/page';


type ResetFormButtonProps = {
  keywordOnInit: string,
  behaviorOfResetBtn: 'restore' | 'clear',
  input: string,
  onReset: () => void,
}

const ResetFormButton: FC<ResetFormButtonProps> = (props: ResetFormButtonProps) => {
  const isClearBtn = props.behaviorOfResetBtn === 'clear';
  const initialKeyword = isClearBtn ? '' : props.keywordOnInit;
  const isHidden = props.input === initialKeyword;

  return isHidden ? (
    <span />
  ) : (
    <button type="button" className="btn btn-link search-clear" onMouseDown={props.onReset}>
      <i className="icon-close" />
    </button>
  );
};


type Props = {
  onSearchSuccess?: (res: IPage[]) => void,
  onSearchError?: (err: Error) => void,
  onChange?: () => void,
  onBlur?: () => void,
  onFocus?: () => void,
  onSubmit?: (input: string) => void,
  onInputChange?: (text: string) => void,
  inputName?: string,
  emptyLabel?: string,
  emptyLabelExceptError?: string,
  placeholder?: string,
  keywordOnInit?: string,
  helpElement?: any,
  autoFocus?: boolean,
  behaviorOfResetBtn?: 'restore' | 'clear',
};

// see https://github.com/ericgio/react-bootstrap-typeahead/issues/266#issuecomment-414987723
type TypeaheadInstance = {
  clear: () => void,
  focus: () => void,
  setState: ({ text: string }) => void,
}
type TypeaheadInstanceFactory = {
  getInstance: () => TypeaheadInstance,
}

export const SearchTypeahead: FC<Props> = (props: Props) => {
  const {
    keywordOnInit,
    onSearchSuccess, onSearchError, onInputChange, onSubmit,
    emptyLabel, emptyLabelExceptError, helpElement,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [input, setInput] = useState(props.keywordOnInit!);
  const [pages, setPages] = useState<IPage[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchError, setSearchError] = useState<Error | null>(null);
  const [isLoading, setLoaded] = useReducer(() => true, false);

  const typeaheadRef = useRef<TypeaheadInstanceFactory>();

  const changeKeyword = (text: string | undefined) => {
    const instance = typeaheadRef.current?.getInstance();
    if (instance != null) {
      instance.clear();
      instance.setState({ text });
    }
  };

  const restoreInitialData = () => {
    changeKeyword(keywordOnInit);
  };

  const clearKeyword = () => {
    changeKeyword('');
  };

  /**
   * Callback function which is occured when search is exit successfully
   */
  const searchSuccessHandler = useCallback((res: AxiosResponse<IPage[]>) => {
    setLoaded();
    setPages(res.data);

    if (onSearchSuccess != null) {
      onSearchSuccess(res.data);
    }
  }, [onSearchSuccess]);

  /**
   * Callback function which is occured when search is exit abnormaly
   */
  const searchErrorHandler = useCallback((err: Error) => {
    setLoaded();
    setSearchError(err);

    if (onSearchError != null) {
      onSearchError(err);
    }
  }, [onSearchError]);

  const search = useCallback(async(keyword: string) => {
    if (keyword === '') {
      return;
    }

    setLoaded();

    try {
      const res = await apiGet('/search', { q: keyword }) as AxiosResponse<IPage[]>;
      searchSuccessHandler(res);
    }
    catch (err) {
      searchErrorHandler(err);
    }
  }, [searchErrorHandler, searchSuccessHandler]);

  const inputChangeHandler = useCallback((text: string) => {
    setInput(text);

    if (onInputChange != null) {
      onInputChange(text);
    }

    if (text === '') {
      setPages([]);
    }
  }, [onInputChange]);

  const keyDownHandler = useCallback((event: KeyboardEvent) => {
    if (event.keyCode === 13) { // Enter key
      if (onSubmit != null) {
        onSubmit(input);
      }
    }
  }, [input, onSubmit]);

  const getEmptyLabel = () => {
    // show help element if empty
    if (input.length === 0) {
      return helpElement;
    }

    // use props.emptyLabel as is if defined
    if (emptyLabel !== undefined) {
      return emptyLabel;
    }

    return (searchError !== null)
      ? 'Error on searching.'
      : (emptyLabelExceptError ?? 'No matches found on title...');
  };

  const defaultSelected = (props.keywordOnInit !== '')
    ? [{ path: props.keywordOnInit }]
    : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputProps: any = { autoComplete: 'off' };
  if (props.inputName != null) {
    inputProps.name = props.inputName;
  }

  const isClearBtn = props.behaviorOfResetBtn === 'clear';
  const resetForm = isClearBtn ? clearKeyword : restoreInitialData;

  const renderMenuItemChildren = (page: IPage) => (
    <span>
      <UserPicture user={page.lastUpdateUser} size="sm" noLink />
      <span className="ml-1 text-break text-wrap"><PagePathLabel page={page} /></span>
      <PageListMeta page={page} />
    </span>
  );

  return (
    <div className="search-typeahead">
      <AsyncTypeahead
        {...props}
        id="search-typeahead-asynctypeahead"
        ref={typeaheadRef}
        inputProps={inputProps}
        isLoading={isLoading}
        labelKey="path"
        minLength={0}
        options={pages} // Search result (Some page names)
        promptText={props.helpElement}
        emptyLabel={getEmptyLabel()}
        align="left"
        submitFormOnEnter
        onSearch={search}
        onInputChange={inputChangeHandler}
        onKeyDown={keyDownHandler}
        renderMenuItemChildren={renderMenuItemChildren}
        caseSensitive={false}
        defaultSelected={defaultSelected}
        autoFocus={props.autoFocus}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
      />
      <ResetFormButton
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        keywordOnInit={props.keywordOnInit!}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        behaviorOfResetBtn={props.behaviorOfResetBtn!}
        input={input}
        onReset={resetForm}
      />
    </div>
  );
};

SearchTypeahead.defaultProps = {
  placeholder: '',
  keywordOnInit: '',
  behaviorOfResetBtn: 'restore',
  autoFocus: false,
};

export default SearchTypeahead;
