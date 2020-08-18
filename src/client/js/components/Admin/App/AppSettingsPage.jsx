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

let retrieveError = null;
function AppSettingsPage(props) {
  if (props.adminAppContainer.state.title === props.adminAppContainer.dummyTitle) {
    throw (async() => {
      try {
        await props.adminAppContainer.retrieveAppSettingsData();
      }
      catch (err) {
        toastError(err);
        logger.error(err);
        props.adminAppContainer.setState({
          title: props.adminAppContainer.dummyTitleForError,
        });
        retrieveError = err;
      }
    })();
  }

  if (props.adminAppContainer.state.title === props.adminAppContainer.dummyTitleForError) {
    throw new Error(retrieveError[0].message);
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
