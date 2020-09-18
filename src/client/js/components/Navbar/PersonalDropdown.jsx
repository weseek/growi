import dynamic from 'next/dynamic';
import React from 'react';

import { useCurrentUser } from '~/stores/context';

import UserPicture from '../User/UserPicture';

const PersonalDropdownButton = () => {
  const { data: user } = useCurrentUser();

  return (
    // remove .dropdown-toggle for hide caret
    // See https://stackoverflow.com/a/44577512/13183572
    <a className="px-md-2 nav-link waves-effect waves-light" data-toggle="dropdown">
      <UserPicture user={user} noLink noTooltip /><span className="d-none d-lg-inline-block">&nbsp;{user.name}</span>
    </a>
  );
};


const PersonalDropdown = () => {
  const PersonalDropdownMenu = dynamic(() => import('./PersonalDropdownMenu'), { ssr: false });

  return (
    <>
      <PersonalDropdownButton />
      <PersonalDropdownMenu />
    </>
  );
};

PersonalDropdown.propTypes = {
};

export default PersonalDropdown;
