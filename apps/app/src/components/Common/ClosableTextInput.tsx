import type { CSSProperties, FC } from 'react';
import React, {
  memo, useCallback, useEffect, useRef, useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import AutosizeInput from 'react-input-autosize';

import type { AlertInfo } from '~/client/util/use-input-validator';
import { AlertType, inputValidator } from '~/client/util/use-input-validator';


// for react-input-autosize
type InputRefCallback = (instance: HTMLInputElement | null) => void;

export type ClosableTextInputProps = {
  value?: string
  placeholder?: string
  validationTarget?: string,
  useAutosizeInput?: boolean
  inputClassName?: string,
  inputStyle?: CSSProperties,
  onPressEnter?(inputText: string): void
  onPressEscape?(inputText: string): void
  onBlur?(inputText: string): void
  onChange?(inputText: string): void
}

const ClosableTextInput: FC<ClosableTextInputProps> = memo((props: ClosableTextInputProps) => {
  const { t } = useTranslation();
  const {
    validationTarget,
    onPressEnter, onPressEscape, onBlur, onChange,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const [inputText, setInputText] = useState(props.value ?? '');
  const [currentAlertInfo, setAlertInfo] = useState<AlertInfo | null>(null);
  const [isAbleToShowAlert, setIsAbleToShowAlert] = useState(false);
  const [isComposing, setComposing] = useState(false);


  const createValidation = useCallback(async(inputText: string) => {
    const alertInfo = await inputValidator(inputText, validationTarget);
    if (alertInfo && alertInfo.message != null && alertInfo.target != null) {
      alertInfo.message = t(alertInfo.message, { target: t(alertInfo.target) });
    }
    setAlertInfo(alertInfo);
  }, [t, validationTarget]);

  const changeHandler = useCallback(async(e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    createValidation(inputText);
    setInputText(inputText);
    setIsAbleToShowAlert(true);

    onChange?.(inputText);
  }, [createValidation, onChange]);

  const onFocusHandler = useCallback(async(e: React.ChangeEvent<HTMLInputElement>) => {
    const inputText = e.target.value;
    await createValidation(inputText);
  }, [createValidation]);

  const pressEnterHandler = useCallback(() => {
    if (currentAlertInfo == null) {
      onPressEnter?.(inputText.trim());
    }
  }, [currentAlertInfo, inputText, onPressEnter]);

  const onKeyDownHandler = useCallback((e) => {
    switch (e.key) {
      case 'Enter':
        // Do nothing when composing
        if (isComposing) {
          return;
        }
        pressEnterHandler();
        break;
      case 'Escape':
        if (isComposing) {
          return;
        }
        onPressEscape?.(inputText.trim());
        break;
      default:
        break;
    }
  }, [inputText, isComposing, pressEnterHandler, onPressEscape]);

  /*
   * Hide when click outside the ref
   */
  const onBlurHandler = useCallback(() => {
    onBlur?.(inputText.trim());
  }, [inputText, onBlur]);

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
    type: 'text',
    placeholder: props.placeholder,
    name: 'input',
    onFocus: onFocusHandler,
    onChange: changeHandler,
    onKeyDown: onKeyDownHandler,
    onCompositionStart: () => setComposing(true),
    onCompositionEnd: () => setComposing(false),
    onBlur: onBlurHandler,
  };

  const inputClassName = `form-control ${props.inputClassName ?? ''}`;
  const inputStyle = props.inputStyle;

  return (
    <div>
      { props.useAutosizeInput
        ? <AutosizeInput inputRef={inputRef as unknown as InputRefCallback} inputClassName={inputClassName} inputStyle={inputStyle} {...inputProps} />
        : <input ref={inputRef} className={inputClassName} style={inputStyle} {...inputProps} />
      }
      {isAbleToShowAlert && <AlertInfo />}
    </div>
  );
});

ClosableTextInput.displayName = 'ClosableTextInput';

export default ClosableTextInput;
