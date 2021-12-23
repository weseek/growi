import React, {
  FC, ForwardRefRenderFunction, forwardRef, useImperativeHandle,
  KeyboardEvent, useCallback, useRef, useState, MouseEvent,
} from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';

import { IFocusable } from '~/client/interfaces/focusable';
import { TypeaheadProps } from '~/client/interfaces/react-bootstrap-typeahead';
import { apiGet } from '~/client/util/apiv1-client';
import { IPageSearchResultData, IFormattedSearchResult } from '~/interfaces/search';


type ResetFormButtonProps = {
  keywordOnInit: string,
  input: string,
  onReset: (e: MouseEvent<HTMLButtonElement>) => void,
}

const ResetFormButton: FC<ResetFormButtonProps> = (props: ResetFormButtonProps) => {
  const isHidden = props.input.length === 0;

  return isHidden ? (
    <span />
  ) : (
    <button type="button" className="btn btn-link search-clear" onMouseDown={props.onReset}>
      <i className="icon-close" />
    </button>
  );
};


type Props = TypeaheadProps & {
  onSearchSuccess?: (res: IPageSearchResultData[]) => void,
  onSearchError?: (err: Error) => void,
  onSubmit?: (input: string) => void,
  inputName?: string,
  keywordOnInit?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  helpElement?: any,
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

const SearchTypeahead: ForwardRefRenderFunction<IFocusable, Props> = (props: Props, ref) => {
  const {
    onSearchSuccess, onSearchError, onInputChange, onSubmit,
    emptyLabel, helpElement, keywordOnInit,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [input, setInput] = useState(props.keywordOnInit!);
  const [pages, setPages] = useState<IPageSearchResultData[]>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchError, setSearchError] = useState<Error | null>(null);
  const [isLoading, setLoading] = useState(false);

  const typeaheadRef = useRef<TypeaheadInstanceFactory>(null);

  const focusToTypeahead = () => {
    const instance = typeaheadRef.current?.getInstance();
    if (instance != null) {
      instance.focus();
    }
  };

  // publish focus()
  useImperativeHandle(ref, () => ({
    focus: focusToTypeahead,
  }));

  const changeKeyword = (text: string | undefined) => {
    const instance = typeaheadRef.current?.getInstance();
    if (instance != null) {
      instance.clear();
      instance.setState({ text });
    }
  };

  const resetForm = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setInput('');
    changeKeyword('');
    focusToTypeahead();
  };

  /**
   * Callback function which is occured when search is exit successfully
   */
  const searchSuccessHandler = useCallback((result: IFormattedSearchResult) => {
    const searchResultData = result.data;
    setPages(searchResultData);

    if (onSearchSuccess != null) {
      onSearchSuccess(searchResultData);
    }
  }, [onSearchSuccess]);

  /**
   * Callback function which is occured when search is exit abnormaly
   */
  const searchErrorHandler = useCallback((err: Error) => {
    setSearchError(err);

    if (onSearchError != null) {
      onSearchError(err);
    }
  }, [onSearchError]);

  const search = useCallback(async(keyword: string) => {
    if (keyword === '') {
      return;
    }

    setLoading(true);

    try {
      const result = await apiGet('/search', { q: keyword }) as IFormattedSearchResult;
      searchSuccessHandler(result);
    }
    catch (err) {
      searchErrorHandler(err);
    }
    finally {
      setLoading(false);
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

    return false;
  };

  const defaultSelected = (keywordOnInit !== '')
    ? [{ path: keywordOnInit }]
    : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputProps: any = { autoComplete: 'off' };
  if (props.inputName != null) {
    inputProps.name = props.inputName;
  }

  const renderMenuItemChildren = (option: IPageSearchResultData) => {
    const { pageData } = option;
    return (
      <span>
        <UserPicture user={pageData.lastUpdateUser} size="sm" noLink />
        <span className="ml-1 text-break text-wrap"><PagePathLabel path={pageData.path} /></span>
        <PageListMeta page={pageData} />
      </span>
    );
  };

  return (
    <div className="search-typeahead">
      <AsyncTypeahead
        {...props}
        id="search-typeahead-asynctypeahead"
        ref={typeaheadRef}
        inputProps={inputProps}
        isLoading={isLoading}
        labelKey={data => data?.pageData?.path || keywordOnInit || ''} // https://github.com/ericgio/react-bootstrap-typeahead/blob/master/docs/Rendering.md#labelkey-stringfunction
        minLength={0}
        options={pages} // Search result (Some page names)
        promptText={props.helpElement}
        emptyLabel={getEmptyLabel()}
        align="left"
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
        input={input}
        onReset={resetForm}
      />
    </div>
  );
};

const ForwardedSearchTypeahead = forwardRef(SearchTypeahead);

ForwardedSearchTypeahead.defaultProps = {
  placeholder: '',
  keywordOnInit: '',
  autoFocus: false,
};

export default ForwardedSearchTypeahead;
