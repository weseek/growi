import { DropdownToggle } from 'reactstrap';

import { Hexagon } from './Hexagon';

import styles from './DropendToggle.module.scss';


const moduleClass = styles['btn-toggle'];


type Props = {
  className?: string
}

export const DropendToggle = (props: Props): JSX.Element => {

  return (
    <DropdownToggle
      className={`position-absolute ${moduleClass} btn btn-primary ${props.className ?? ''}`}
    >
      <Hexagon />
      <div className="hitarea position-absolute" />
      <span className="icon material-symbols-outlined position-absolute">chevron_right</span>
    </DropdownToggle>
  );
};
