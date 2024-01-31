import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import { DropdownToggle } from 'reactstrap';

import { Hexagon } from './Hexagon';

import styles from './DropendToggle.module.scss';


const moduleClass = styles['btn-toggle'];


type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const DropendToggle = (props: Props): JSX.Element => {

  return (
    <DropdownToggle
      className={`position-absolute ${moduleClass} btn btn-primary z-1 ${props.className ?? ''}`}
    >
      <Hexagon />
      <div className="hitarea position-absolute" />
      <span className="icon material-symbols-outlined position-absolute">chevron_right</span>
    </DropdownToggle>
  );
};
