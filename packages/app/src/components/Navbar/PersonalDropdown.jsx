import React from 'react';

import { UserPicture } from '@growi/ui';
import { useTranslation } from 'next-i18next';

import { toastError } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { useCurrentUser } from '~/stores/context';

const PersonalDropdown = () => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  const user = currentUser || {};

  const logoutHandler = async() => {
    try {
      await apiv3Post('/logout');
      window.location.reload();
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      {/* Button */}
      {/* remove .dropdown-toggle for hide caret */}
      {/* See https://stackoverflow.com/a/44577512/13183572 */}
      <a className="px-md-3 nav-link waves-effect waves-light" data-toggle="dropdown">
        <UserPicture user={user} noLink noTooltip /><span className="ml-1 d-none d-lg-inline-block">&nbsp;{user.name}</span>
      </a>

      {/* Menu */}
      <div className="dropdown-menu dropdown-menu-right">

        <div className="px-4 pt-3 pb-2 text-center">
          <UserPicture user={user} size="lg" noLink noTooltip />

          <h5 className="mt-2">
            {user.name}
          </h5>

          <div className="my-2">
            <i className="icon-user icon-fw"></i>{user.username}<br />
            <i className="icon-envelope icon-fw"></i><span className="grw-email-sm">{user.email}</span>
          </div>

          <div className="btn-group btn-block mt-2" role="group">
            <a className="btn btn-sm btn-outline-secondary col" href={`/user/${user.username}`}>
              <i className="icon-fw icon-home"></i>{ t('personal_dropdown.home') }
            </a>
            <a className="btn btn-sm btn-outline-secondary col" href="/me">
              <i className="icon-fw icon-wrench"></i>{ t('personal_dropdown.settings') }
            </a>
          </div>
        </div>

        <div className="dropdown-divider"></div>

        <button type="button" className="dropdown-item" onClick={logoutHandler}><i className="icon-fw icon-power"></i>{ t('Sign out') }</button>
      </div>

    </>
  );

};

export default PersonalDropdown;
