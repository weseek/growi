import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import { Hexagon } from './Hexagon';

import styles from './CreateButton.module.scss';

const moduleClass = styles['btn-create'];


type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export const CreateButton = (props: Props): React.ReactElement => {
  return (
    <button
      type="button"
      {...props}
      className={`${moduleClass} btn btn-primary ${props.className ?? ''}`}
    >
      <Hexagon />
      <span className="icon material-symbols-outlined position-absolute" aria-label="Create">edit</span>
    </button>
  );
};
