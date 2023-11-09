import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import { Hexagon } from './Hexagon';

import styles from './DropendToggle.module.scss';

const moduleClass = styles['btn-toggle'];


type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export const DropendToggle = (props: Props): JSX.Element => {
  return (
    <button
      type="button"
      {...props}
      className={`${moduleClass} btn btn-primary ${props.className ?? ''}`}
    >
      <Hexagon />
      <div className="hitarea position-absolute" />
      <span className="icon material-symbols-outlined position-absolute">chevron_right</span>
    </button>
  );
};
