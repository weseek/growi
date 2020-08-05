import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

import NotificationSettingPageContents from './NotificationSettingPageContents';

const logger = loggerFactory('growi:NotificationSetting');

function NotificationSetting(props) {

  if (props.adminNotificationContainer.state.selectSlackOption === 0) {
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
  return <NotificationSettingPageContents />;
}

const NotificationSettingWrapper = withUnstatedContainers(NotificationSetting, [AdminNotificationContainer]);

NotificationSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,

};

function NotificationSettingSuspenseWrapper(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <NotificationSettingWrapper />
    </Suspense>
  );
}

export default NotificationSettingSuspenseWrapper;
