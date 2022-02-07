import React, {
  FC, memo, useEffect, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';

export const AlertType = {
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type AlertType = typeof AlertType[keyof typeof AlertType];

export type AlertInfo = {
  type?: AlertType
  message?: string
}

type ClosableTextInputProps = {
  isShown: boolean
  value?: string
  placeholder?: string
  inputValidator?(text: string): AlertInfo | Promise<AlertInfo> | null
  onPressEnter?(inputText: string | null): void
  onClickOutside?(): void
}

const ClosableTextInput: FC<ClosableTextInputProps> = memo((props: ClosableTextInputProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputText, setInputText] = useState(props.value);
  const [canKeyDownHandler, setCanKeyDownHandler] = useState(false);
  const [currentAlertInfo, setAlertInfo] = useState<AlertInfo | null>(null);

  const onChangeHandler = async(e) => {
    if (props.inputValidator == null) { return }

    const inputText = e.target.value;

    const alertInfo = await props.inputValidator(inputText);

    // eslint-disable-next-line no-unused-expressions
    alertInfo == null ? setCanKeyDownHandler(true) : setCanKeyDownHandler(false);

    setAlertInfo(alertInfo);
    setInputText(inputText);
  };

  const onPressEnter = () => {
    if (props.onPressEnter == null) {
      return;
    }

    const text = inputText != null ? inputText.trim() : null;

    props.onPressEnter(text);
  };

  const onKeyDownHandler = (e) => {
    if (canKeyDownHandler && e.key === 'Enter') {
      onPressEnter();
    }
  };

  /*
   * Hide when click outside the ref
   */
  const onBlurHandler = () => {
    if (props.onClickOutside == null) {
      return;
    }

    props.onClickOutside();
  };

  // didMount
  useEffect(() => {
    // autoFocus
    if (inputRef?.current == null) {
      return;
    }
    inputRef.current.focus();
  });


  const AlertInfo = () => {
    if (currentAlertInfo == null) {
      return <></>;
    }

    const alertType = currentAlertInfo.type != null ? currentAlertInfo.type : AlertType.ERROR;
    const alertMessage = currentAlertInfo.message != null ? currentAlertInfo.message : 'Invalid value';
    const alertTextStyle = alertType === AlertType.ERROR ? 'text-danger' : 'text-warning';
    const translation = alertType === AlertType.ERROR ? 'Error' : 'Warning';
    return (
      <p className={`${alertTextStyle} text-center mt-1`}>{t(translation)}: {alertMessage}</p>
    );
  };


  return (
    <div className={props.isShown ? 'd-block' : 'd-none'}>
      <input
        value={inputText}
        ref={inputRef}
        type="text"
        className="form-control"
        placeholder={props.placeholder}
        name="input"
        onChange={onChangeHandler}
        onKeyDown={onKeyDownHandler}
        onBlur={onBlurHandler}
        autoFocus={false}
      />
      <AlertInfo />
    </div>
  );
});

export default ClosableTextInput;
