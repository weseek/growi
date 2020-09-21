import dynamic from 'next/dynamic';
import React from 'react';

import {
  UncontrolledDropdown, DropdownToggle,
} from 'reactstrap';

import { useCurrentUser } from '~/stores/context';

import UserPicture from '../User/UserPicture';

const PersonalDropdownButton = () => {
  const { data: user } = useCurrentUser();

  return (
    // remove .dropdown-toggle for hide caret
    // See https://stackoverflow.com/a/44577512/13183572
    <DropdownToggle tag="a" className="px-md-2 nav-link waves-effect waves-light">
      <UserPicture user={user} noLink noTooltip /><span className="d-none d-lg-inline-block">&nbsp;{user.name}</span>
    </DropdownToggle>
  );
};


const PersonalDropdown = () => {
  // dynamic import to skip rendering at SSR
  const PersonalDropdownMenu = dynamic(() => import('./PersonalDropdownMenu'), { ssr: false });

  return (
    <UncontrolledDropdown>
      <PersonalDropdownButton />
      <PersonalDropdownMenu />
    </UncontrolledDropdown>
  );
};

PersonalDropdown.propTypes = {
};

export default PersonalDropdown;
