import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import { Hexagon } from './Hexagon';

import styles from './CreateButton.module.scss';

const moduleClass = styles['btn-create'];


type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export const CreateButton = (props: Props): JSX.Element => {
  return (
    <button
      type="button"
      {...props}
      className={`${moduleClass} btn btn-primary`}
      data-testid="grw-sidebar-nav-page-create-button"
    >
      <Hexagon />
      <span className="icon material-symbols-outlined position-absolute">edit</span>
    </button>
  );
};
