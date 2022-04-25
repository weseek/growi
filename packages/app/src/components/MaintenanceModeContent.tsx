import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import AppContainer from '~/client/services/AppContainer';

import { withUnstatedContainers } from './UnstatedUtils';

const MaintenanceModeContent = (props) => {
  const { t } = useTranslation();

  const isUserLoggedIn = props.appContainer.currentUser != null;

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
            <a href="/login">{ t('maintenance_mode.login') }</a>
          </p>
        )
        : (
          <p>
            <form action="/_api/v3/logout" name="form1" method="post">
              <i className="icon-arrow-right"></i>
              {/* <a href="javascript:form1.submit()" id="maintanounse-mode-logout">{ t('maintenance_mode.logout') }</a> */}
              <a href="" id="maintanounse-mode-logout">{ t('maintenance_mode.logout') }</a>
            </form>
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
