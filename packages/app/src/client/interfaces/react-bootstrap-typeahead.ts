// https://github.com/ericgio/react-bootstrap-typeahead/blob/5.x/docs/API.md
export type TypeaheadProps = {
  dropup?: boolean,
  emptyLabel?: string,
  placeholder?: string,
  autoFocus?: boolean,

  onChange?: (data: unknown[]) => void,
  onBlur?: () => void,
  onFocus?: () => void,
  onIncrementalSearch?: (text: string) => void,
  onKeyDown?: (input: string) => void,
};
