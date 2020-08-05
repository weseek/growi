import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminAppContainer from '../../../services/AdminAppContainer';

import AppSettingsPageContents from './AppSettingsPageContents';

const logger = loggerFactory('growi:appSettings');

function AppSettingsPage(props) {

  if (props.adminAppContainer.state.title === undefined) {
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

  return <AppSettingsPageContents />;
}

AppSettingsPage.propTypes = {
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const AppSettingsPageWrapper = withUnstatedContainers(AppSettingsPage, [AdminAppContainer]);

function AppSettingsPageSuspenseWrapper(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <AppSettingsPageWrapper />
    </Suspense>
  );
}

export default AppSettingsPageSuspenseWrapper;
