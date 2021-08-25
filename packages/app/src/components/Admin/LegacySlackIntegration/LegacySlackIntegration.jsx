import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';
import { withLoadingSppiner } from '../../SuspenseUtils';

import AdminSlackIntegrationLegacyContainer from '~/client/services/AdminSlackIntegrationLegacyContainer';

import SlackConfiguration from './SlackConfiguration';

const logger = loggerFactory('growi:NotificationSetting');

let retrieveErrors = null;
function LegacySlackIntegration(props) {
  const { adminSlackIntegrationLegacyContainer } = props;

  if (adminSlackIntegrationLegacyContainer.state.webhookUrl === adminSlackIntegrationLegacyContainer.dummyWebhookUrl) {
    throw (async() => {
      try {
        await adminSlackIntegrationLegacyContainer.retrieveNotificationData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        logger.error(errs);
        retrieveErrors = errs;
        adminSlackIntegrationLegacyContainer.setState({ webhookUrl: adminSlackIntegrationLegacyContainer.dummyWebhookUrlForError });
      }
    })();
  }

  if (adminSlackIntegrationLegacyContainer.state.webhookUrl === adminSlackIntegrationLegacyContainer.dummyWebhookUrlForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return (
    <SlackConfiguration />
  );
}

const LegacySlackIntegrationWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(LegacySlackIntegration), [AdminSlackIntegrationLegacyContainer]);

LegacySlackIntegration.propTypes = {
  adminSlackIntegrationLegacyContainer: PropTypes.instanceOf(AdminSlackIntegrationLegacyContainer).isRequired,
};

export default LegacySlackIntegrationWithUnstatedContainer;
