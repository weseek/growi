import type { FC } from 'react';
import React, {
  memo, useEffect, useRef, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import AutosizeInput from 'react-input-autosize';

import type { AlertInfo } from '~/client/util/input-validator';
import { AlertType, inputValidator } from '~/client/util/input-validator';

type ClosableTextInputProps = {
  value?: string
  placeholder?: string
  validationTarget?: string,
  useAutosize?: boolean
  onPressEnter?(inputText: string | null): void
  onPressEscape?: () => void
  onClickOutside?(): void
  handleInputChange?: (string) => void
}

const ClosableTextInput: FC<ClosableTextInputProps> = memo((props: ClosableTextInputProps) => {
  const { t } = useTranslation();
  const { validationTarget } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState(props.value);
  const [currentAlertInfo, setAlertInfo] = useState<AlertInfo | null>(null);
  const [isAbleToShowAlert, setIsAbleToShowAlert] = useState(false);
  const [isComposing, setComposing] = useState(false);


  const createValidation = async(inputText: string) => {
    const alertInfo = await inputValidator(inputText, validationTarget);
    if (alertInfo && alertInfo.message != null && alertInfo.target != null) {
      alertInfo.message = t(alertInfo.message, { target: t(alertInfo.target) });
    }
    setAlertInfo(alertInfo);
  };

  const onChangeHandler = async(e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    createValidation(inputText);
    setInputText(inputText);
    setIsAbleToShowAlert(true);

    props.handleInputChange?.(inputText);
  };

  const onFocusHandler = async(e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    await createValidation(inputText);
  };

  const onPressEnter = () => {
    if (props.onPressEnter != null) {
      const text = inputText != null ? inputText.trim() : null;
      if (currentAlertInfo == null) {
        props.onPressEnter(text);
      }
    }
  };

  const onKeyDownHandler = (e) => {
    switch (e.key) {
      case 'Enter':
        // Do nothing when composing
        if (isComposing) {
          return;
        }
        onPressEnter();
        break;
      case 'Escape':
        if (isComposing) {
          return;
        }
        props.onPressEscape?.();
        break;
      default:
        break;
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

  const inputProps = {
    'data-testid': 'closable-text-input',
    value: inputText || '',
    ref: inputRef,
    type: 'text',
    placeholder: props.placeholder,
    name: 'input',
    onFocus: onFocusHandler,
    onChange: onChangeHandler,
    onKeyDown: onKeyDownHandler,
    onCompositionStart: () => setComposing(true),
    onCompositionEnd: () => setComposing(false),
    onBlur: onBlurHandler,
  };

  return (
    <div>
      { props.useAutosize
        ? <AutosizeInput {...inputProps} />
        : <input className="form-control" {...inputProps} />
      }
      {isAbleToShowAlert && <AlertInfo />}
    </div>
  );
});

ClosableTextInput.displayName = 'ClosableTextInput';

export default ClosableTextInput;
