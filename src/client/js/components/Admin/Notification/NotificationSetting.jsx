import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

import RenderNotificationSetting from './RenderNotificationSetting';

const logger = loggerFactory('growi:NotificationSetting');

function NotificationSetting(props) {

  if (props.adminNotificationContainer.state.isRetrieving) {
    throw new Promise(async() => {
      try {
        await props.adminNotificationContainer.retrieveNotificationData();
      }
      catch (err) {
        toastError(err);
        props.adminNotificationContainer.setState({ retrieveError: err });
        logger.error(err);
      }
    });
  }
  return <RenderNotificationSetting />;
}

const NotificationSettingWrapper = withUnstatedContainers(NotificationSetting, [AdminNotificationContainer]);

NotificationSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

export default withTranslation()(NotificationSettingWrapper);
