import React, { Suspense } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminAppContainer from '../../../services/AdminAppContainer';

import RenderAppSettingsPage from './RenderAppSettingsPage';

const logger = loggerFactory('growi:appSettings');

class AppSettingsPage extends React.Component {

  async componentDidMount() {
    const { adminAppContainer } = this.props;

    try {
      await adminAppContainer.retrieveAppSettingsData();
    }
    catch (err) {
      toastError(err);
      adminAppContainer.setState({ retrieveError: err.message });
      logger.error(err);
    }
  }

  render() {
    return (
      <Suspense fallback={<div className="text-center"><i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i></div>}>
        <RenderAppSettingsPage />
      </Suspense>
    );
  }

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
