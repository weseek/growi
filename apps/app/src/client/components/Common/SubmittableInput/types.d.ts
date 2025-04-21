// TODO: remove ignore in https://redmine.weseek.co.jp/issues/164904
// biome-ignore lint/correctness/noUndeclaredVariables: ignore
export type SubmittableInputProps<T extends InputHTMLAttributes<HTMLInputElement> = InputHTMLAttributes<HTMLInputElement>> =
  // biome-ignore lint/correctness/noUndeclaredVariables: ignore
  Omit<InputHTMLAttributes<T>, 'value' | 'onKeyDown' | 'onSubmit'>
  & {
    value?: string,
    onSubmit?: (inputText: string) => void,
    onCancel?: () => void,
  }
