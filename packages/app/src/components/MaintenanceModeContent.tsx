import React from 'react';

import { useTranslation } from 'react-i18next';

import { toastError } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { useCurrentUser } from '~/stores/context';


const MaintenanceModeContent = () => {
  const { t } = useTranslation();

  const { data: currentUser } = useCurrentUser();

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
    <div className="text-left">
      {currentUser?.admin
      && (
        <p>
          <i className="icon-arrow-right"></i>
          <a className="btn btn-link" href="/admin">{ t('maintenance_mode.admin_page') }</a>
        </p>
      )}
      {currentUser != null
        ? (
          <p>
            <i className="icon-arrow-right"></i>
            <a className="btn btn-link" onClick={logoutHandler} id="maintanounse-mode-logout">{ t('maintenance_mode.logout') }</a>
          </p>
        )
        : (
          <p>
            <i className="icon-arrow-right"></i>
            <a className="btn btn-link" href="/login">{ t('maintenance_mode.login') }</a>
          </p>
        )
      }
    </div>
  );

};


export default MaintenanceModeContent;
