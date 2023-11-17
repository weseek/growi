import { useState } from 'react';

import styles from './MaskedInput.module.scss';

type Props = {
  name: string
  readOnly: boolean
  defaultValue: string
  onChange?: (e: any) => void
  tabIndex?: number | undefined
};

export default function MaskedInput(props: Props): JSX.Element {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const {
    name, readOnly, defaultValue, onChange, tabIndex,
  } = props;

  return (
    <div className={styles.MaskedInput}>
      <input
        className="form-control"
        type={passwordShown ? 'text' : 'password'}
        name={name}
        readOnly={readOnly}
        defaultValue={defaultValue}
        onChange={onChange}
        tabIndex={tabIndex}
      />
      <span onClick={togglePassword} className={styles.PasswordReveal}>
        {passwordShown ? (
          <i className="fa fa-eye" />
        ) : (
          <i className="fa fa-eye-slash" />
        )}
      </span>
    </div>
  );
}
