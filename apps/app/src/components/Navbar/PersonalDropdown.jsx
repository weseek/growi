import React, { useRef } from 'react';

import { UserPicture } from '@growi/ui/dist/components/User/UserPicture';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRipple } from 'react-use-ripple';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import { useCurrentUser } from '~/stores/context';

const PersonalDropdown = () => {
  const { t } = useTranslation('commons');
  const { data: currentUser } = useCurrentUser();

  // ripple
  const buttonRef = useRef(null);
  useRipple(buttonRef, { rippleColor: 'rgba(255, 255, 255, 0.3)' });

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
      <button className="bg-transparent border-0 nav-link" type="button" ref={buttonRef} data-toggle="dropdown" data-testid="personal-dropdown-button">
        <UserPicture user={user} noLink noTooltip /><span className="ml-1 d-none d-lg-inline-block">&nbsp;{user.name}</span>
      </button>

      {/* Menu */}
      <div className="dropdown-menu dropdown-menu-right" data-testid="personal-dropdown-menu">

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
            <Link
              href={`/user/${user.username}`}
              className="btn btn-sm btn-outline-secondary col"
              data-testid="grw-personal-dropdown-menu-user-home"
            >
              <i className="icon-fw icon-home"></i>{t('personal_dropdown.home')}
            </Link>
            <Link
              href="/me"
              className="btn btn-sm btn-outline-secondary col"
              data-testid="grw-personal-dropdown-menu-user-settings"
            >
              <i className="icon-fw icon-wrench"></i>{t('personal_dropdown.settings')}
            </Link>
          </div>
        </div>

        <div className="dropdown-divider"></div>

        <button type="button" className="dropdown-item" onClick={logoutHandler}><i className="icon-fw icon-power"></i>{t('Sign out')}</button>
      </div>

    </>
  );

};

export default PersonalDropdown;
