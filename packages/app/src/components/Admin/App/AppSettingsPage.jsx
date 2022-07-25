import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import AdminAppContainer from '~/client/services/AdminAppContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppSettingsPageContents from './AppSettingsPageContents';

const logger = loggerFactory('growi:appSettings');

// let retrieveErrors = null;
function AppSettingsPage(props) {

  const { adminAppContainer } = props;

  useEffect(() => {
    const fetchAppSettingsData = async() => {
      await adminAppContainer.retrieveAppSettingsData();
    };

    try {
      fetchAppSettingsData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminAppContainer]);

  return <AppSettingsPageContents />;
}

AppSettingsPage.propTypes = {
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const AppSettingsPageWithUnstatedContainer = withUnstatedContainers(AppSettingsPage, [AdminAppContainer]);

export default AppSettingsPageWithUnstatedContainer;
