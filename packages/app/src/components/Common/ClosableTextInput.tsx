import React, {
  FC, memo, useEffect, useRef, useState,
} from 'react';

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
  placeholder?: string
  inputValidator?(text: string): AlertInfo | Promise<AlertInfo> | null
  onPressEnter?(): void
  onClickOutside?(): void
}

const ClosableTextInput: FC<ClosableTextInputProps> = memo((props: ClosableTextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentAlertInfo, setAlertInfo] = useState<AlertInfo | null>(null);

  const onChangeHandler = async(e) => {
    if (props.inputValidator == null) { return }

    const alertInfo = await props.inputValidator(e.target.value);

    setAlertInfo(alertInfo);
  };

  const onPressEnter = () => {
    if (props.onPressEnter == null) {
      return;
    }

    props.onPressEnter();
  };

  const onKeyDownHandler = (e) => {
    switch (e.key) {
      case 'Enter':
        onPressEnter();
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

    return (
      <p className="alert alert-danger">{alertType}: {alertMessage}</p>
    );
  };


  return (
    <div className={props.isShown ? 'd-block' : 'd-none'}>
      <input
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
      <div>
        {/* {currentAlertInfo != null && ( */}
        <AlertInfo />
        {/* // )} */}
      </div>
    </div>
  );
});

export default ClosableTextInput;
