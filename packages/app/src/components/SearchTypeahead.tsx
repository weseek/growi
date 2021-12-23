import React, {
  FC, ForwardRefRenderFunction, forwardRef, useImperativeHandle,
  KeyboardEvent, useCallback, useRef, useState, MouseEventHandler,
} from 'react';
// eslint-disable-next-line no-restricted-imports
import { AxiosResponse } from 'axios';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';

import { UserPicture, PageListMeta, PagePathLabel } from '@growi/ui';

import { IFocusable } from '~/client/interfaces/focusable';
import { TypeaheadProps } from '~/client/interfaces/react-bootstrap-typeahead';
import { apiGet } from '~/client/util/apiv1-client';
import { IPage } from '~/interfaces/page';


type ResetFormButtonProps = {
  keywordOnInit: string,
  input: string,
  onReset: MouseEventHandler,
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
  onSearchSuccess?: (res: IPage[]) => void,
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
    emptyLabel, helpElement,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [input, setInput] = useState(props.keywordOnInit!);
  const [pages, setPages] = useState<IPage[]>();
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

  const resetForm = (e: MouseEvent) => {
    e.preventDefault();

    setInput('');
    changeKeyword('');
    focusToTypeahead();
  };

  /**
   * Callback function which is occured when search is exit successfully
   */
  const searchSuccessHandler = useCallback((res: AxiosResponse<IPage[]>) => {
    setPages(res.data);

    if (onSearchSuccess != null) {
      onSearchSuccess(res.data);
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
      const res = await apiGet('/search', { q: keyword }) as AxiosResponse<IPage[]>;
      searchSuccessHandler(res);
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

  const defaultSelected = (props.keywordOnInit !== '')
    ? [{ path: props.keywordOnInit }]
    : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputProps: any = { autoComplete: 'off' };
  if (props.inputName != null) {
    inputProps.name = props.inputName;
  }

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
