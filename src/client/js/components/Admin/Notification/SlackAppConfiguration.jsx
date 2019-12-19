import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

class SlackAppConfiguration extends React.Component {

  render() {
    return (
      <React.Fragment>
        <h2 className="border-bottom">Slack Incoming Webhooks Configuration</h2>
      </React.Fragment>
    );
  }

}

const SlackAppConfigurationWrapper = (props) => {
  return createSubscribedElement(SlackAppConfiguration, props, [AppContainer, AdminNotificationContainer]);
};

SlackAppConfiguration.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(SlackAppConfigurationWrapper);
