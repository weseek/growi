import React, {
  FC, ForwardRefRenderFunction, forwardRef, useImperativeHandle,
  KeyboardEvent, useCallback, useRef, useState, MouseEvent, useEffect,
} from 'react';

import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';

import { IFocusable } from '~/client/interfaces/focusable';
import { TypeaheadProps } from '~/client/interfaces/react-bootstrap-typeahead';
import { IPageSearchMeta } from '~/interfaces/search';
import { IPageWithMeta } from '~/interfaces/page';
import { useSWRxFullTextSearch } from '~/stores/search';


type ResetFormButtonProps = {
  input?: string,
  onReset: (e: MouseEvent<HTMLButtonElement>) => void,
}

const ResetFormButton: FC<ResetFormButtonProps> = (props: ResetFormButtonProps) => {
  const { input, onReset } = props;

  const isHidden = input == null || input.length === 0;

  return isHidden ? (
    <span />
  ) : (
    <button type="button" className="btn btn-outline-secondary search-clear text-muted border-0" onMouseDown={onReset}>
      <i className="icon-close" />
    </button>
  );
};


type Props = TypeaheadProps & {
  onSearchError?: (err: Error) => void,
  onSubmit?: (input: string) => void,
  keywordOnInit?: string,
  disableIncrementalSearch?: boolean,
  helpElement?: React.ReactNode,
};

// see https://github.com/ericgio/react-bootstrap-typeahead/issues/266#issuecomment-414987723
type TypeaheadInstance = {
  clear: () => void,
  focus: () => void,
  toggleMenu: () => void,
}

const SearchTypeahead: ForwardRefRenderFunction<IFocusable, Props> = (props: Props, ref) => {
  const {
    onSearchError, onSearch, onInputChange, onSubmit,
    inputProps, keywordOnInit, disableIncrementalSearch, helpElement,
  } = props;

  const [input, setInput] = useState(keywordOnInit);
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: searchResult, error: searchError } = useSWRxFullTextSearch(
    disableIncrementalSearch ? null : searchKeyword,
    { limit: 10 },
  );

  const isLoading = searchResult == null && searchError == null;
  const showHelp = input == null || input.length === 0;

  const typeaheadRef = useRef<TypeaheadInstance>(null);

  const focusToTypeahead = () => {
    const instance = typeaheadRef.current;
    if (instance != null) {
      instance.focus();
    }
  };

  const clearTypeahead = () => {
    const instance = typeaheadRef.current;
    if (instance != null) {
      instance.clear();
    }
  };

  // publish focus()
  useImperativeHandle(ref, () => ({
    focus: focusToTypeahead,
  }));

  const resetForm = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setInput('');
    setSearchKeyword('');

    clearTypeahead();
    focusToTypeahead();

    if (onSearch != null) {
      onSearch('');
    }
  }, [onSearch]);

  const searchHandler = useCallback((text: string) => {
    setSearchKeyword(text);

    if (onSearch != null) {
      onSearch(text);
    }
  }, [onSearch]);

  const inputChangeHandler = useCallback((text: string) => {
    setInput(text);

    if (onInputChange != null) {
      onInputChange(text);
    }
  }, [onInputChange]);

  const keyDownHandler = useCallback((event: KeyboardEvent) => {
    if (event.keyCode === 13) { // Enter key
      if (onSubmit != null && input != null && input.length > 0) {
        onSubmit(input);
      }
    }
  }, [input, onSubmit]);

  useEffect(() => {
    if (onSearchError != null && searchError != null) {
      onSearchError(searchError);
    }
  }, [onSearchError, searchError]);

  const defaultSelected = (keywordOnInit !== '')
    ? [{ path: keywordOnInit }]
    : [];

  const renderHelp = useCallback((results, menuProps) => {
    return (
      <Menu {...menuProps}>
        {helpElement}
      </Menu>
    );
  }, [helpElement]);

  const renderMenuItemChildren = useCallback((option: IPageWithMeta<IPageSearchMeta>) => {
    const { data: pageData } = option;
    return (
      <span>
        <UserPicture user={pageData.lastUpdateUser} size="sm" noLink />
        <span className="ml-1 mr-2 text-break text-wrap"><PagePathLabel path={pageData.path} /></span>
        <PageListMeta page={pageData} />
      </span>
    );
  }, []);

  return (
    <div className="search-typeahead">
      <AsyncTypeahead
        {...props}
        id="search-typeahead-asynctypeahead"
        ref={typeaheadRef}
        delay={400}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputProps={{ autoComplete: 'off', ...(inputProps as any ?? {}) }}
        isLoading={isLoading}
        labelKey={data => data?.pageData?.path || keywordOnInit || ''} // https://github.com/ericgio/react-bootstrap-typeahead/blob/master/docs/Rendering.md#labelkey-stringfunction
        options={searchResult?.data} // Search result (Some page names)
        filterBy={() => true}
        align="left"
        open
        renderMenu={renderHelp}
        // renderMenuItemChildren={renderMenuItemChildren}
        defaultSelected={defaultSelected}
        autoFocus={props.autoFocus}
        onSearch={searchHandler}
        onInputChange={inputChangeHandler}
        onKeyDown={keyDownHandler}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
      />
      <ResetFormButton
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
