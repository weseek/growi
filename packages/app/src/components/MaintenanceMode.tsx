import React, { FC, useCallback } from 'react';
import { useTranslation } from 'next-i18next';

import { toastError } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';
import { useCurrentUser } from '~/stores/context';

export const MaintenanceMode: FC = () => {
  const { t } = useTranslation();

  const { data: currentUser } = useCurrentUser();

  const logoutHandler = useCallback(async() => {
    try {
      await apiv3Post('/logout');
      window.location.reload();
    }
    catch (err) {
      toastError(err);
    }
  }, []);

  return (
    <div id="content-main" className="content-main container-lg">
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-md-6 mt-5">
            <div className="text-center">
              <h1><i className="icon-exclamation large"></i></h1>
              <h1 className="text-center">{ t('maintenance_mode.maintenance_mode') }</h1>
              <h3>{ t('maintenance_mode.growi_is_under_maintenance') }</h3>
              <hr />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
