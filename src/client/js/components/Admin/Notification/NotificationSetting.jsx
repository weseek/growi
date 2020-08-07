import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AdminNotificationContainer from '../../../services/AdminNotificationContainer';

import NotificationSettingContents from './NotificationSettingContents';

const logger = loggerFactory('growi:NotificationSetting');

function NotificationSetting(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <RenderNotificationSettingWrapper />
    </Suspense>
  );
}

function RenderNotificationSetting(props) {
  const { adminNotificationContainer } = props;
  if (adminNotificationContainer.state.selectSlackOption === adminNotificationContainer.dummySelectSlackOption) {
    throw new Promise(async() => {
      try {
        await adminNotificationContainer.retrieveNotificationData();
      }
      catch (err) {
        toastError(err);
        adminNotificationContainer.setState({ retrieveError: err });
        logger.error(err);
      }
    });
  }

  return <NotificationSettingContents />;
}

const RenderNotificationSettingWrapper = withUnstatedContainers(RenderNotificationSetting, [AdminNotificationContainer]);

RenderNotificationSetting.propTypes = {
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,
};

export default NotificationSetting;
