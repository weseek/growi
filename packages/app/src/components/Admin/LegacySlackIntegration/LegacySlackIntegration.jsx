import React, { useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminSlackIntegrationLegacyContainer from '~/client/services/AdminSlackIntegrationLegacyContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';


import SlackConfiguration from './SlackConfiguration';

const logger = loggerFactory('growi:NotificationSetting');

const retrieveErrors = null;
function LegacySlackIntegration(props) {
  const { t } = useTranslation();
  const { adminSlackIntegrationLegacyContainer } = props;

  if (adminSlackIntegrationLegacyContainer.state.webhookUrl === adminSlackIntegrationLegacyContainer.dummyWebhookUrl) {
    // TODO: Omit AdminSlackIntegrationLegacyContainer by https://redmine.weseek.co.jp/issues/100947

    // throw (async() => {
    //   try {
    //     await adminSlackIntegrationLegacyContainer.retrieveData();
    //   }
    //   catch (err) {
    //     const errs = toArrayIfNot(err);
    //     toastError(errs);
    //     logger.error(errs);
    //     retrieveErrors = errs;
    //     adminSlackIntegrationLegacyContainer.setState({ webhookUrl: adminSlackIntegrationLegacyContainer.dummyWebhookUrlForError });
    //   }
    // })();
  }

  if (adminSlackIntegrationLegacyContainer.state.webhookUrl === adminSlackIntegrationLegacyContainer.dummyWebhookUrlForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  const isDisabled = adminSlackIntegrationLegacyContainer.state.isSlackbotConfigured;

  return (
    <div data-testid="admin-slack-integration-legacy">
      { isDisabled && (
        <div className="alert alert-danger">
          <i className="icon-minus icon-fw"></i>
          {/* eslint-disable-next-line react/no-danger */}
          <span dangerouslySetInnerHTML={{ __html: t('admin:slack_integration_legacy.alert_disabled') }}></span>
        </div>
      ) }

      <div className="alert alert-warning">
        <i className="icon-info icon-fw"></i>
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: t('admin:slack_integration_legacy.alert_deplicated') }}></span>
      </div>

      <SlackConfiguration />
    </div>
  );
}

const LegacySlackIntegrationWithUnstatedContainer = withUnstatedContainers(LegacySlackIntegration, [AdminSlackIntegrationLegacyContainer]);

LegacySlackIntegration.propTypes = {
  adminSlackIntegrationLegacyContainer: PropTypes.instanceOf(AdminSlackIntegrationLegacyContainer).isRequired,
};

export default LegacySlackIntegrationWithUnstatedContainer;
