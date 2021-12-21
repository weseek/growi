// https://github.com/ericgio/react-bootstrap-typeahead/blob/3.x/docs/Props.md
export type TypeaheadProps = {
  dropup?: boolean,
  emptyLabel?: string,
  placeholder?: string,
  autoFocus?: boolean,

  onChange?: (data: unknown[]) => void,
  onBlur?: () => void,
  onFocus?: () => void,
  onInputChange?: (text: string) => void,
  onKeyDown?: (input: string) => void,
};
