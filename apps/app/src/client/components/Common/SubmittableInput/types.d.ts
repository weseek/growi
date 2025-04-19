export type SubmittableInputProps<T extends React.InputHTMLAttributes<HTMLInputElement> = React.InputHTMLAttributes<HTMLInputElement>> =
  Omit<React.InputHTMLAttributes<T>, 'value' | 'onKeyDown' | 'onSubmit'>
  & {
    value?: string,
    onSubmit?: (inputText: string) => void,
    onCancel?: () => void,
  }
