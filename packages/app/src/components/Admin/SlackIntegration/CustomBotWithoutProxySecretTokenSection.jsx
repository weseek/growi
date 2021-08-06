import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '~/client/util/apiNotification';


const CustomBotWithoutProxySecretTokenSection = (props) => {
  const {
    appContainer, slackSigningSecret, slackBotToken, slackSigningSecretEnv, slackBotTokenEnv, onUpdatedSecretToken,
  } = props;
  const { t } = useTranslation();

  const [inputSigningSecret, setInputSigningSecret] = useState(slackSigningSecret || '');
  const [inputBotToken, setInputBotToken] = useState(slackBotToken || '');

  // update states when props are updated
  useEffect(() => {
    setInputSigningSecret(slackSigningSecret || '');
  }, [slackSigningSecret]);
  useEffect(() => {
    setInputBotToken(slackBotToken || '');
  }, [slackBotToken]);

  const updatedSecretToken = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/without-proxy/update-settings', {
        slackSigningSecret: inputSigningSecret,
        slackBotToken: inputBotToken,
      });

      if (onUpdatedSecretToken != null) {
        onUpdatedSecretToken(inputSigningSecret, inputBotToken);
      }

      toastSuccess(t('toaster.update_successed', { target: t('admin:slack_integration.custom_bot_without_proxy_settings') }));
    }
    catch (err) {
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
            value={inputSigningSecret}
            onChange={e => setInputSigningSecret(e.target.value)}
          />
        </div>

        <div className="col-sm">
          <p>Environment variables</p>
          <input
            className="form-control"
            type="text"
            defaultValue={slackSigningSecretEnv}
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
            value={inputBotToken}
            onChange={e => setInputBotToken(e.target.value)}
          />
        </div>

        <div className="col-sm">
          <p>Environment variables</p>
          <input
            className="form-control"
            type="text"
            defaultValue={slackBotTokenEnv}
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
  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,
};

export default CustomBotWithoutProxySecretTokenSectionWrapper;
