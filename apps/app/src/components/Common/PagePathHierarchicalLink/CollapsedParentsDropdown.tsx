import { useMemo } from 'react';

import Link from 'next/link';
import {
  DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown,
} from 'reactstrap';

import type LinkedPagePath from '~/models/linked-page-path';

import styles from './CollapsedParentsDropdown.module.scss';

const getAncestorPathAndPathName = (linkedPagePath: LinkedPagePath) => {
  const data: Array<{ path: string, pathName: string }> = [];
  let linkedPagePathTmp = linkedPagePath;

  while (linkedPagePathTmp.parent != null) {
    data.push({ path: linkedPagePathTmp.path, pathName: linkedPagePathTmp.pathName });
    linkedPagePathTmp = linkedPagePathTmp.parent;
  }

  const reversedData = data.reverse();
  return reversedData;
};

type Props = {
  linkedPagePath: LinkedPagePath,
}

export const CollapsedParentsDropdown = (props: Props): JSX.Element => {
  const { linkedPagePath } = props;

  const ancestorPathAndPathName = useMemo(() => getAncestorPathAndPathName(linkedPagePath), [linkedPagePath]);

  return (
    <UncontrolledDropdown className="d-inline-block">
      <DropdownToggle color="transparent">...</DropdownToggle>
      <DropdownMenu className={`dropdown-menu ${styles['collapsed-parents-dropdown-menu']}`} container="body">
        {ancestorPathAndPathName.map(data => (
          <DropdownItem key={data.path}>
            <Link href={data.path} legacyBehavior>
              <a role="menuitem">{data.pathName}</a>
            </Link>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};
