import React, {
  FC, ForwardRefRenderFunction, forwardRef, useImperativeHandle,
  KeyboardEvent, useCallback, useRef, useState, MouseEvent, useEffect,
} from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';

import { IFocusable } from '~/client/interfaces/focusable';
import { TypeaheadProps } from '~/client/interfaces/react-bootstrap-typeahead';
import { IPageSearchMeta } from '~/interfaces/search';
import { IPageWithMeta } from '~/interfaces/page';
import { useSWRxFullTextSearch } from '~/stores/search';


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
    <button type="button" className="btn btn-outline-secondary search-clear text-muted border-0" onMouseDown={props.onReset}>
      <i className="icon-close" />
    </button>
  );
};


type Props = TypeaheadProps & {
  onSearchError?: (err: Error) => void,
  onSubmit?: (input: string) => void,
  inputName?: string,
  keywordOnInit?: string,
  disableIncrementalSearch?: boolean,
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
    onSearchError, onIncrementalSearch, onSubmit,
    emptyLabel, helpElement, keywordOnInit, disableIncrementalSearch,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [input, setInput] = useState(props.keywordOnInit!);

  const keyword = disableIncrementalSearch ? null : input;
  const { data: searchResult, error: searchError } = useSWRxFullTextSearch(keyword, { limit: 10 });

  const isLoading = searchResult == null && searchError == null;

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

    if (onIncrementalSearch != null) {
      onIncrementalSearch('');
    }
  };

  const searchHandler = useCallback((text: string) => {
    setInput(text);

    if (onIncrementalSearch != null) {
      onIncrementalSearch(text);
    }
  }, [onIncrementalSearch]);

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

    return <></>;
  };

  useEffect(() => {
    if (onSearchError != null && searchError != null) {
      onSearchError(searchError);
    }
  }, [onSearchError, searchError]);

  const defaultSelected = (keywordOnInit !== '')
    ? [{ path: keywordOnInit }]
    : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputProps: any = { autoComplete: 'off' };
  if (props.inputName != null) {
    inputProps.name = props.inputName;
  }

  const renderMenuItemChildren = (option: IPageWithMeta<IPageSearchMeta>) => {
    const { data: pageData } = option;
    return (
      <span>
        <UserPicture user={pageData.lastUpdateUser} size="sm" noLink />
        <span className="ml-1 mr-2 text-break text-wrap"><PagePathLabel path={pageData.path} /></span>
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
        // inputProps={inputProps}
        isLoading={isLoading}
        labelKey={data => data?.pageData?.path || keywordOnInit || ''} // https://github.com/ericgio/react-bootstrap-typeahead/blob/master/docs/Rendering.md#labelkey-stringfunction
        options={searchResult?.data} // Search result (Some page names)
        filterBy={() => true}
        promptText={props.helpElement}
        emptyLabel={disableIncrementalSearch ? null : getEmptyLabel()}
        align="left"
        onSearch={searchHandler}
        onKeyDown={keyDownHandler}
        renderMenuItemChildren={renderMenuItemChildren}
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
