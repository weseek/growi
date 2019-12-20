import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminNotificationContainer from '../../../services/AdminNotificationContainer';


class GrobalNotification extends React.Component {

  render() {
    const { t } = this.props;
    return (
      <React.Fragment>
        <h2 className="border-bottom mb-5">{t('notification_setting.notification_list')}</h2>
      </React.Fragment>
    );
  }

}

const GrobalNotificationWrapper = (props) => {
  return createSubscribedElement(GrobalNotification, props, [AppContainer, AdminNotificationContainer]);
};

GrobalNotification.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(GrobalNotificationWrapper);
