import React, { useEffect } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminSlackIntegrationLegacyContainer from '~/client/services/AdminSlackIntegrationLegacyContainer';
import { toastError } from '~/client/util/toastr';
import { toArrayIfNot } from '~/utils/array-utils';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';


import SlackConfiguration from './SlackConfiguration';

const logger = loggerFactory('growi:NotificationSetting');

const LegacySlackIntegration = (props) => {
  const { t } = useTranslation();
  const { adminSlackIntegrationLegacyContainer } = props;


  useEffect(() => {
    const fetchLegacySlackIntegrationData = async() => {
      await adminSlackIntegrationLegacyContainer.retrieveData();
    };

    try {
      fetchLegacySlackIntegrationData();
    }
    catch (err) {
      const errs = toArrayIfNot(err);
      toastError(errs);
      logger.error(errs);
    }
  }, [adminSlackIntegrationLegacyContainer]);


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
};

const LegacySlackIntegrationWithUnstatedContainer = withUnstatedContainers(LegacySlackIntegration, [AdminSlackIntegrationLegacyContainer]);

LegacySlackIntegration.propTypes = {
  adminSlackIntegrationLegacyContainer: PropTypes.instanceOf(AdminSlackIntegrationLegacyContainer).isRequired,
};

export default LegacySlackIntegrationWithUnstatedContainer;
