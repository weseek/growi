import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminAppContainer from '../../../services/AdminAppContainer';

import AppSettingsPageContents from './AppSettingsPageContents';

const logger = loggerFactory('growi:appSettings');

function AppSettingsPageWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <AppSettingsPageWithUnstatedContainer />
    </Suspense>
  );
}

function AppSettingsPage(props) {
  if (props.adminAppContainer.state.title === props.adminAppContainer.dummyTitle) {
    throw new Promise(async() => {
      try {
        await props.adminAppContainer.retrieveAppSettingsData();
      }
      catch (err) {
        toastError(err);
        props.adminAppContainer.setState({ title: props.adminAppContainer.dummyTitleForError, retrieveError: err[0].message });
        logger.error(err);
      }
    });
  }

  if (props.adminAppContainer.state.title === props.adminAppContainer.dummyTitleForError) {
    throw new Error(props.adminAppContainer.state.retrieveError);
  }

  return <AppSettingsPageContents />;
}

AppSettingsPage.propTypes = {
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const AppSettingsPageWithUnstatedContainer = withUnstatedContainers(AppSettingsPage, [AdminAppContainer]);

export default AppSettingsPageWithContainerWithSuspense;
