import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import toArrayIfNot from '../../../../../lib/util/toArrayIfNot';

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

let retrieveErrors = null;
function NotificationSetting(props) {
  const { adminNotificationContainer } = props;
  if (adminNotificationContainer.state.webhookUrl === adminNotificationContainer.dummyWebhookUrl) {
    throw (async() => {
      try {
        await adminNotificationContainer.retrieveNotificationData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        logger.error(errs);
        retrieveErrors = errs;
        adminNotificationContainer.setState({ webhookUrl: adminNotificationContainer.dummyWebhookUrlForError });
      }
    })();
  }

  if (adminNotificationContainer.state.webhookUrl === adminNotificationContainer.dummyWebhookUrlForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return <NotificationSettingContents />;
}

const NotificationSettingWithUnstatedContainer = withUnstatedContainers(NotificationSetting, [AdminNotificationContainer]);

NotificationSetting.propTypes = {
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,
};

export default NotificationSettingWithContainerWithSuspense;
