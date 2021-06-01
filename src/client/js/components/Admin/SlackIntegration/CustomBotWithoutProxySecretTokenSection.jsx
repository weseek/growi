import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';

import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import { toastSuccess, toastError } from '../../../util/apiNotification';

const CustomBotWithoutProxySecretTokenSection = (props) => {
  const {
    appContainer, slackSigningSecret, slackSigningSecretEnv, slackBotToken, slackBotTokenEnv,
    onUpdatedSecretToken, onSigningSecretChanged, onBotTokenChanged,
  } = props;
  const { t } = useTranslation();

  const signingSecretChanged = (signingSecretInput) => {
    if (onSigningSecretChanged != null) {
      onSigningSecretChanged(signingSecretInput);
    }
  };

  const botTokenChanged = (botTokenInput) => {
    if (onBotTokenChanged != null) {
      onBotTokenChanged(botTokenInput);
    }
  };

  const currentBotType = 'customBotWithoutProxy';
  const updatedSecretToken = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/without-proxy/update-settings', {
        slackSigningSecret,
        slackBotToken,
        currentBotType,
      });
      onUpdatedSecretToken(true);
      toastSuccess(t('toaster.update_successed', { target: t('admin:slack_integration.custom_bot_without_proxy_settings') }));
    }
    catch (err) {
      onUpdatedSecretToken(false);
      toastError(err);
    }
  };

  return (
    <div className="w-75 mx-auto">

      <h3>Signing Secret</h3>
      <div className="row">

        <div className="col-sm">
          <p>Database</p>
          <input
            className="form-control"
            type="text"
            value={slackSigningSecret || ''}
            onChange={e => signingSecretChanged(e.target.value)}
          />
        </div>

        <div className="col-sm">
          <p>Environment variables</p>
          <input
            className="form-control"
            type="text"
            value={slackSigningSecretEnv || ''}
            readOnly
          />
          <p className="form-text text-muted">
            {/* eslint-disable-next-line react/no-danger */}
            <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_SIGNING_SECRET' }) }} />
          </p>
        </div>
      </div>

      <h3>Bot User OAuth Token</h3>
      <div className="row">

        <div className="col-sm">
          <p>Database</p>
          <input
            className="form-control"
            type="text"
            value={slackBotToken || ''}
            onChange={e => botTokenChanged(e.target.value)}
          />
        </div>

        <div className="col-sm">
          <p>Environment variables</p>
          <input
            className="form-control"
            type="text"
            value={slackBotTokenEnv || ''}
            readOnly
          />
          <p className="form-text text-muted">
            {/* eslint-disable-next-line react/no-danger */}
            <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_BOT_TOKEN' }) }} />
          </p>
        </div>

      </div>
      <AdminUpdateButtonRow onClick={updatedSecretToken} disabled={false} />
    </div>
  );
};

const CustomBotWithoutProxySecretTokenSectionWrapper = withUnstatedContainers(CustomBotWithoutProxySecretTokenSection, [AppContainer]);

CustomBotWithoutProxySecretTokenSection.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  onUpdatedSecretToken: PropTypes.func,
  onSigningSecretChanged: PropTypes.func,
  onBotTokenChanged: PropTypes.func,
  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,
};

export default CustomBotWithoutProxySecretTokenSectionWrapper;
