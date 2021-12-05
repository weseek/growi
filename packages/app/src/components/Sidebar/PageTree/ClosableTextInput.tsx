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
  const ref = useRef<HTMLInputElement>(null);

  const [currentAlertInfo, setAlertInfo] = useState<AlertInfo | null>(null);

  const onChangeHandler = async(e) => {
    if (props.inputValidator == null) { return }

    const alertInfo = await props.inputValidator(e.target.value);

    setAlertInfo(alertInfo);
  };

  const onKeyDownHandler = (e) => {
    if (e.key !== 'Enter') {
      return;
    }
    if (props.onPressEnter == null) {
      return;
    }

    props.onPressEnter();
  };

  /*
   * Hide when click outside the ref
   */
  const handleClickOutside = (e) => {
    if (ref.current != null && !ref.current.contains(e.target) && props.onClickOutside != null) {
      props.onClickOutside();
    }

    return;
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  // TODO: improve style
  return (
    <div ref={ref} className={props.isShown ? 'd-block' : 'd-none'}>
      <input
        type="text"
        className="form-control"
        placeholder={props.placeholder}
        name="input"
        onChange={onChangeHandler}
        onKeyDown={onKeyDownHandler}
      />
      <div>
        {currentAlertInfo != null && (
          <p>
            {/* eslint-disable-next-line max-len */}
            {currentAlertInfo.type != null ? currentAlertInfo.type : AlertType.ERROR}: {currentAlertInfo.message != null ? currentAlertInfo.message : 'Invalid value' }
          </p>
        )}
      </div>
    </div>
  );
});

export default ClosableTextInput;
