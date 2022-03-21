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
    onBlur, onFocus,
  } = props;

  const [input, setInput] = useState(keywordOnInit);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isForcused, setFocused] = useState(false);

  const { data: searchResult, error: searchError } = useSWRxFullTextSearch(
    disableIncrementalSearch ? null : searchKeyword,
    { limit: 10 },
  );

  const isLoading = searchResult == null && searchError == null;

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

  const labelKey = useCallback((option?: IPageWithMeta<IPageSearchMeta>) => {
    return option?.data.path ?? '';
  }, []);

  const renderMenu = useCallback((options: IPageWithMeta<IPageSearchMeta>[], menuProps) => {
    const isEmptyInput = input == null || input.length === 0;

    if (!isForcused) {
      return <></>;
    }

    if (isEmptyInput) {
      if (helpElement != null) {
        return (
          <Menu {...menuProps}>
            <div className="p-3">
              {helpElement}
            </div>
          </Menu>
        );
      }

      return <></>;
    }

    return (
      <Menu {...menuProps}>
        {options.map((pageWithMeta, index) => (
          <MenuItem key={pageWithMeta.data._id} option={pageWithMeta} position={index}>
            <span>
              <UserPicture user={pageWithMeta.data.lastUpdateUser} size="sm" noLink />
              <span className="ml-1 mr-2 text-break text-wrap"><PagePathLabel path={pageWithMeta.data.path} /></span>
              <PageListMeta page={pageWithMeta.data} />
            </span>
          </MenuItem>
        ))}
      </Menu>
    );
  }, [helpElement, input, isForcused]);

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
        labelKey={labelKey}
        defaultInputValue={keywordOnInit}
        options={searchResult?.data} // Search result (Some page names)
        filterBy={() => true}
        align="left"
        open
        renderMenu={renderMenu}
        autoFocus={props.autoFocus}
        onSearch={searchHandler}
        onInputChange={inputChangeHandler}
        onKeyDown={keyDownHandler}
        onBlur={() => {
          setFocused(false);
          if (onBlur != null) {
            onBlur();
          }
        }}
        onFocus={() => {
          setFocused(true);
          if (onFocus != null) {
            onFocus();
          }
        }}
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
