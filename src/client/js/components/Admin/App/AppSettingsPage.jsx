import React from 'react';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';
import { withLoadingSppiner } from '../../SuspenseUtils';

import AdminAppContainer from '../../../services/AdminAppContainer';

import AppSettingsPageContents from './AppSettingsPageContents';

const logger = loggerFactory('growi:appSettings');

let retrieveErrors = null;
function AppSettingsPage(props) {
  if (props.adminAppContainer.state.title === props.adminAppContainer.dummyTitle) {
    throw (async() => {
      try {
        await props.adminAppContainer.retrieveAppSettingsData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        logger.error(errs);
        props.adminAppContainer.setState({
          title: props.adminAppContainer.dummyTitleForError,
        });
        retrieveErrors = errs;
      }
    })();
  }

  if (props.adminAppContainer.state.title === props.adminAppContainer.dummyTitleForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return <AppSettingsPageContents />;
}

AppSettingsPage.propTypes = {
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const AppSettingsPageWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(AppSettingsPage), [AdminAppContainer]);

export default AppSettingsPageWithUnstatedContainer;
