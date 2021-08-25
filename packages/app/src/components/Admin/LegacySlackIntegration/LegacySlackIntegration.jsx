import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';
import { withLoadingSppiner } from '../../SuspenseUtils';

import AdminNotificationContainer from '~/client/services/AdminNotificationContainer';

import SlackConfiguration from './SlackConfiguration';

const logger = loggerFactory('growi:NotificationSetting');

let retrieveErrors = null;
function LegacySlackIntegration(props) {
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

  return (
    <SlackConfiguration />
  );
}

const LegacySlackIntegrationWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(LegacySlackIntegration), [AdminNotificationContainer]);

LegacySlackIntegration.propTypes = {
  adminNotificationContainer: PropTypes.instanceOf(AdminNotificationContainer).isRequired,
};

export default LegacySlackIntegrationWithUnstatedContainer;
