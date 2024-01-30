import { DropdownToggle } from 'reactstrap';

import { Hexagon } from './Hexagon';

import styles from './DropendToggle.module.scss';


const moduleClass = styles['btn-toggle'];


export const DropendToggle = (): JSX.Element => {
  return (
    <DropdownToggle
      color="primary"
      className={`position-absolute ${moduleClass}`}
      aria-expanded={false}
      data-testid="grw-page-create-button-dropend-toggle"
    >
      <Hexagon />
      <div className="hitarea position-absolute" />
      <span className="icon material-symbols-outlined position-absolute">chevron_right</span>
    </DropdownToggle>
  );
};
