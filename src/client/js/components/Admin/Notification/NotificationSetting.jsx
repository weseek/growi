import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

import NotificationSettingContents from './NotificationSettingContents';

const logger = loggerFactory('growi:NotificationSetting');

function NotificationSettingWithContainerWithSuspense(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <NotificationSettingWithUnstatedContainer />
    </Suspense>
  );
}

let retrieveError = null;
function NotificationSetting(props) {
  const { adminNotificationContainer } = props;
  if (adminNotificationContainer.state.webhookUrl === adminNotificationContainer.dummyWebhookUrl) {
    throw (async() => {
      try {
        await adminNotificationContainer.retrieveNotificationData();
      }
      catch (err) {
        toastError(err);
        adminNotificationContainer.setState({ webhookUrl: adminNotificationContainer.dummyWebhookUrlForError });
        retrieveError = err;
        logger.error(err);
      }
    })();
  }

  if (adminNotificationContainer.state.webhookUrl === adminNotificationContainer.dummyWebhookUrlForError) {
    throw new Error(retrieveError[0].message);
  }

  return <NotificationSettingContents />;
}

const NotificationSettingWithUnstatedContainer = withUnstatedContainers(NotificationSetting, [AdminNotificationContainer]);

NotificationSetting.propTypes = {
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,
};

export default NotificationSettingWithContainerWithSuspense;
