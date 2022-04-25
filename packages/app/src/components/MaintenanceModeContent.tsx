import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';
import { toastError } from '~/client/util/apiNotification';

import { withUnstatedContainers } from './UnstatedUtils';

const MaintenanceModeContent = (props) => {
  const { t } = useTranslation();
  const { appContainer } = props;

  const isUserLoggedIn = appContainer.currentUser != null;

  const logoutHandler = async() => {
    try {
      appContainer.apiv3Post('/logout');
      window.location.reload();
    }
    catch (err) {
      toastError(err);
    }

  };

  return (
    <div className="text-left">
      <p>
        <i className="icon-arrow-right"></i>
        <a href="/admin">{ t('maintenance_mode.admin_page') }</a>
      </p>
      {isUserLoggedIn
        ? (
          <p>
            <i className="icon-arrow-right"></i>
            <a href="" onClick={logoutHandler} id="maintanounse-mode-logout">{ t('maintenance_mode.logout') }</a>
          </p>
        )
        : (
          <p>
            <i className="icon-arrow-right"></i>
            <a href="/login">{ t('maintenance_mode.login') }</a>
          </p>
        )
      }
    </div>
  );

};

MaintenanceModeContent.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withUnstatedContainers(MaintenanceModeContent, [AppContainer]);
