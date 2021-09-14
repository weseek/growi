import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '~/utils/logger';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess, toastError } from '~/client/util/apiNotification';

const logger = loggerFactory('growi:passwordReset');

class UserActivationExecution extends React.Component {

  constructor(props) {
    super(props);

    // get token from URL
    const pathname = window.location.pathname.split('/');
    this.token = pathname[2];

    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    this.activateUser();
  }

  async activateUser() {
    const { t, appContainer } = this.props;

    try {
      const _token = this.token;
      await appContainer.apiv3Put('/user-activation', {
        token: _token,
      });

      this.setState({ isLoading: true });
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, appContainer } = this.props;
    const { isLoading } = this.state;

    let statustext = 'Validating, please wait...';
    if (isLoading === true) {
      statustext = 'Your account activated successfully';
    }

    return (
      <div className={`alert mb-3 alert-${isLoading ? 'success' : 'warning'}`}>
        <h2>{ statustext }</h2>
      </div>
    );
  }

}

const UserActivationExecutionWrapper = withUnstatedContainers(UserActivationExecution, [AppContainer]);

UserActivationExecution.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(UserActivationExecutionWrapper);
