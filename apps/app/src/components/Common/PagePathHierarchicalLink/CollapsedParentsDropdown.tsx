import {
  DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown,
} from 'reactstrap';

import LinkedPagePath from '~/models/linked-page-path';


import styles from './CollapsedParentsDropdown.module.scss';


type Props = {
  linkedPagePath: LinkedPagePath,
}

export const CollapsedParentsDropdown = (props: Props): JSX.Element => {
  const { linkedPagePath } = props;

  return (
    <UncontrolledDropdown className="d-inline-block">
      <DropdownToggle color="transparent">...</DropdownToggle>
      <DropdownMenu className={`dropdown-menu ${styles['collapsed-parents-dropdown-menu']}`} container="body">
        {/* TODO: generate DropdownItems */}
        <DropdownItem>
          <a role="menuitem">foo</a>
        </DropdownItem>
        <DropdownItem>
          <a role="menuitem">bar</a>
        </DropdownItem>
        <DropdownItem>
          <a role="menuitem">baz</a>
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};
