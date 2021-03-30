import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const CustomBotNonProxySettings = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation();

  const [slackSigningSecret, setSlackSigningSecret] = useState('');
  const [slackBotToken, setSlackBotToken] = useState('');
  const [slackSigningSecretEnv, setSlackSigningSecretEnv] = useState('');
  const [slackBotTokenEnv, setSlackBotTokenEnv] = useState('');
  const botType = 'non-proxy';

  const fetchData = useCallback(async() => {
    try {
      const res = await appContainer.apiv3.get('/slack-integration/');
      const {
        slackSigningSecret, slackBotToken, slackSigningSecretEnvVars, slackBotTokenEnvVars,
      } = res.data.slackBotSettingParams.customBotNonProxySettings;
      setSlackSigningSecret(slackSigningSecret);
      setSlackBotToken(slackBotToken);
      setSlackSigningSecretEnv(slackSigningSecretEnvVars);
      setSlackBotTokenEnv(slackBotTokenEnvVars);
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function updateHandler() {
    try {
      await appContainer.apiv3.put('/slack-integration/custom-bot-non-proxy', {
        slackSigningSecret,
        slackBotToken,
        botType,
      });
      toastSuccess(t('toaster.update_successed', { target: t('admin:slack_integration.custom_bot_non_proxy_settings') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  return (
    <>
      <div className="row my-5">
        <div className="mx-auto">
          <button
            type="button"
            className="btn btn-primary text-nowrap mx-1"
            onClick={() => window.open('https://api.slack.com/apps', '_blank')}
          >
            {t('admin:slack_integration.non_proxy.create_bot')}
          </button>
        </div>
      </div>
      <table className="table settings-table">
        <colgroup>
          <col className="item-name" />
          <col className="from-db" />
          <col className="from-env-vars" />
        </colgroup>
        <thead>
          <tr><th></th><th>Database</th><th>Environment variables</th></tr>
        </thead>
        <tbody>
          <tr>
            <th>Signing Secret</th>
            <td>
              <input
                className="form-control"
                type="text"
                value={slackSigningSecret || ''}
                onChange={e => setSlackSigningSecret(e.target.value)}
              />
            </td>
            <td>
              <input
                className="form-control"
                type="text"
                value={slackSigningSecretEnv || ''}
                readOnly
              />
              <p className="form-text text-muted">
                <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_SIGNING_SECRET' }) }} />
              </p>
            </td>
          </tr>
          <tr>
            <th>Bot User OAuth Token</th>
            <td>
              <input
                className="form-control"
                type="text"
                value={slackBotToken || slackBotTokenEnv || ''}
                onChange={e => setSlackBotToken(e.target.value)}
              />
            </td>
            <td>
              <input
                className="form-control"
                type="text"
                value={slackSigningSecretEnv || ''}
                readOnly
              />
              <p className="form-text text-muted">
                <small dangerouslySetInnerHTML={{ __html: t('admin:slack_integration.use_env_var_if_empty', { variable: 'SLACK_SIGNING_SECRET' }) }} />
              </p>
            </td>

          </tr>
        </tbody>
      </table>


      <AdminUpdateButtonRow onClick={updateHandler} disabled={false} />
    </>
  );
};

const CustomBotNonProxySettingsWrapper = withUnstatedContainers(CustomBotNonProxySettings, [AppContainer]);

CustomBotNonProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default CustomBotNonProxySettingsWrapper;
