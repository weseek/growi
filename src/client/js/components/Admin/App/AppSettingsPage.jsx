import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminAppContainer from '../../../services/AdminAppContainer';

import RenderAppSettingsPage from './RenderAppSettingsPage';

const logger = loggerFactory('growi:appSettings');

function AppSettingsPage(props) {

  if (props.adminAppContainer.state.isRetrieving) {
    throw new Promise(async() => {
      try {
        await props.adminAppContainer.retrieveAppSettingsData();
      }
      catch (err) {
        toastError(err);
        props.adminAppContainer.setState({ retrieveError: err.message });
        logger.error(err);
      }
    });
  }

  return <RenderAppSettingsPage />;
}


AppSettingsPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const AppSettingsPageWrapper = withUnstatedContainers(AppSettingsPage, [AdminAppContainer]);


export default withTranslation()(AppSettingsPageWrapper);
