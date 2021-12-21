import React, {
  FC, KeyboardEvent, useCallback, useMemo, useReducer, useState,
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

  const changeKeyword = (text) => {
    // see https://github.com/ericgio/react-bootstrap-typeahead/issues/266#issuecomment-414987723
    // const instance = this.typeahead.getInstance();
    // instance.clear();
    // instance.setState({ text });
    console.log('changeKeyword', text);
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
        // ref={(c) => { this.typeahead = c }}
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

// class SearchTypeahead extends React.Component {

//   constructor(props) {

//     super(props);

//     this.state = {
//       input: this.props.keywordOnInit,
//       pages: [],
//       isLoading: false,
//       searchError: null,
//     };

//     this.restoreInitialData = this.restoreInitialData.bind(this);
//     this.clearKeyword = this.clearKeyword.bind(this);
//     this.changeKeyword = this.changeKeyword.bind(this);
//     this.search = this.search.bind(this);
//     this.onInputChange = this.onInputChange.bind(this);
//     this.onKeyDown = this.onKeyDown.bind(this);
//     this.dispatchSubmit = this.dispatchSubmit.bind(this);
//     this.getEmptyLabel = this.getEmptyLabel.bind(this);
//     this.getResetFormButton = this.getResetFormButton.bind(this);
//     this.renderMenuItemChildren = this.renderMenuItemChildren.bind(this);
//     this.getTypeahead = this.getTypeahead.bind(this);
//   }

//   /**
//    * Get instance of AsyncTypeahead
//    */
//   getTypeahead() {
//     return this.typeahead ? this.typeahead.getInstance() : null;
//   }

//   componentDidMount() {
//   }

//   componentWillUnmount() {
//   }

//   /**
//    * Initialize keywordyword
//    */
//   restoreInitialData() {
//     this.changeKeyword(this.props.keywordOnInit);
//   }

//   /**
//    * clear keyword
//    */
//   clearKeyword(text) {
//     this.changeKeyword('');
//   }

//   /**
//    * change keyword
//    */
//   changeKeyword(text) {
//     // see https://github.com/ericgio/react-bootstrap-typeahead/issues/266#issuecomment-414987723
//     const instance = this.typeahead.getInstance();
//     instance.clear();
//     instance.setState({ text });
//   }

//   search(keyword) {

//     if (keyword === '') {
//       return;
//     }

//     this.setState({ isLoading: true });

//     apiGet('/search', { q: keyword })
//       .then((res) => { this.onSearchSuccess(res) })
//       .catch((err) => { this.onSearchError(err) });
//   }

//   /**
//    * Callback function which is occured when search is exit successfully
//    * @param {*} pages
//    */
//   onSearchSuccess(res) {
//     this.setState({
//       isLoading: false,
//       pages: res.data,
//     });
//     if (this.props.onSearchSuccess != null) {
//       this.props.onSearchSuccess(res);
//     }
//   }

//   /**
//    * Callback function which is occured when search is exit abnormaly
//    * @param {*} err
//    */
//   onSearchError(err) {
//     this.setState({
//       isLoading: false,
//       searchError: err,
//     });
//     if (this.props.onSearchError != null) {
//       this.props.onSearchError(err);
//     }
//   }

//   onInputChange(text) {
//     this.setState({ input: text });
//     this.props.onInputChange(text);
//     if (text === '') {
//       this.setState({ pages: [] });
//     }
//   }

//   onKeyDown(event) {
//     if (event.keyCode === 13) {
//       this.dispatchSubmit();
//     }
//   }

//   dispatchSubmit() {
//     if (this.props.onSubmit != null) {
//       this.props.onSubmit(this.state.input);
//     }
//   }

//   getEmptyLabel() {
//     const { emptyLabel, helpElement } = this.props;
//     const { input } = this.state;

//     // show help element if empty
//     if (input.length === 0) {
//       return helpElement;
//     }

//     // use props.emptyLabel as is if defined
//     if (emptyLabel !== undefined) {
//       return this.props.emptyLabel;
//     }

//     let emptyLabelExceptError = 'No matches found on title...';
//     if (this.props.emptyLabelExceptError !== undefined) {
//       emptyLabelExceptError = this.props.emptyLabelExceptError;
//     }

//     return (this.state.searchError !== null)
//       ? 'Error on searching.'
//       : emptyLabelExceptError;
//   }

//   /**
//    * Get restore form button to initialize button
//    */
//   getResetFormButton() {
//     const isClearBtn = this.props.behaviorOfResetBtn === 'clear';
//     const initialKeyword = isClearBtn ? '' : this.props.keywordOnInit;
//     const isHidden = this.state.input === initialKeyword;
//     const resetForm = isClearBtn ? this.clearKeyword : this.restoreInitialData;

//     return isHidden ? (
//       <span />
//     ) : (
//       <button type="button" className="btn btn-link search-clear" onMouseDown={resetForm}>
//         <i className="icon-close" />
//       </button>
//     );
//   }

//   renderMenuItemChildren(option, props, index) {
//     const page = option;
//     return (
//       <span>
//         <UserPicture user={page.lastUpdateUser} size="sm" noLink />
//         <span className="ml-1 text-break text-wrap"><PagePathLabel page={page} /></span>
//         <PageListMeta page={page} />
//       </span>
//     );
//   }

//   render() {
//     const defaultSelected = (this.props.keywordOnInit !== '')
//       ? [{ path: this.props.keywordOnInit }]
//       : [];
//     const inputProps = { autoComplete: 'off' };
//     if (this.props.inputName != null) {
//       inputProps.name = this.props.inputName;
//     }

//     const resetFormButton = this.getResetFormButton();

//     return (
//       <div className="search-typeahead">
//         <AsyncTypeahead
//           {...this.props}
//           id="search-typeahead-asynctypeahead"
//           ref={(c) => { this.typeahead = c }}
//           inputProps={inputProps}
//           isLoading={this.state.isLoading}
//           labelKey="path"
//           minLength={0}
//           options={this.state.pages} // Search result (Some page names)
//           promptText={this.props.helpElement}
//           emptyLabel={this.getEmptyLabel()}
//           align="left"
//           submitFormOnEnter
//           onSearch={this.search}
//           onInputChange={this.onInputChange}
//           onKeyDown={this.onKeyDown}
//           renderMenuItemChildren={this.renderMenuItemChildren}
//           caseSensitive={false}
//           defaultSelected={defaultSelected}
//           autoFocus={this.props.autoFocus}
//           onBlur={this.props.onBlur}
//           onFocus={this.props.onFocus}
//         />
//         {resetFormButton}
//       </div>
//     );
//   }

// }

/**
 * Properties
 */
SearchTypeahead.defaultProps = {
  placeholder: '',
  keywordOnInit: '',
  behaviorOfResetBtn: 'restore',
  autoFocus: false,
};

export default SearchTypeahead;
