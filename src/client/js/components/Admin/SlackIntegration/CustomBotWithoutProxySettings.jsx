import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import SlackGrowiBridging from './SlackGrowiBridging';


const CustomBotWithoutProxySettings = (props) => {
  const { appContainer, adminAppContainer } = props;
  const { t } = useTranslation();

  const [slackSigningSecret, setSlackSigningSecret] = useState('');
  const [slackBotToken, setSlackBotToken] = useState('');
  const [slackSigningSecretEnv, setSlackSigningSecretEnv] = useState('');
  const [slackBotTokenEnv, setSlackBotTokenEnv] = useState('');
  const [slackWSNameInWithoutProxy, setSlackWSNameInWithoutProxy] = useState(null);
  // get site name from this GROWI
  // eslint-disable-next-line no-unused-vars
  const [siteName, setSiteName] = useState('');
  const currentBotType = 'custom-bot-without-proxy';

  const getSlackWSInWithoutProxy = useCallback(async() => {
    try {
      const res = await appContainer.apiv3.get('/slack-integration/custom-bot-without-proxy/slack-workspace-name');
      setSlackWSNameInWithoutProxy(res.data.slackWorkSpaceName);
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer]);

  const fetchData = useCallback(async() => {
    try {
      await adminAppContainer.retrieveAppSettingsData();
      const res = await appContainer.apiv3.get('/slack-integration/');
      const {
        slackSigningSecret, slackBotToken, slackSigningSecretEnvVars, slackBotTokenEnvVars,
      } = res.data.slackBotSettingParams.customBotWithoutProxySettings;
      setSlackSigningSecret(slackSigningSecret);
      setSlackBotToken(slackBotToken);
      setSlackSigningSecretEnv(slackSigningSecretEnvVars);
      setSlackBotTokenEnv(slackBotTokenEnvVars);
      setSiteName(adminAppContainer.state.title);
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer, adminAppContainer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function updateHandler() {
    try {
      await appContainer.apiv3.put('/slack-integration/custom-bot-without-proxy', {
        slackSigningSecret,
        slackBotToken,
        currentBotType,
      });
      getSlackWSInWithoutProxy();
      toastSuccess(t('toaster.update_successed', { target: t('admin:slack_integration.custom_bot_without_proxy_settings') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  return (
    <>
      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_settings')}</h2>
      {/* temporarily put bellow component */}
      <SlackGrowiBridging
        siteName={siteName}
        slackWorkSpaceName={slackWSNameInWithoutProxy}
      />
      <div className="row my-5">
        <div className="mx-auto">
          <button
            type="button"
            className="btn btn-primary text-nowrap mx-1"
            onClick={() => window.open('https://api.slack.com/apps', '_blank')}
          >
            {t('admin:slack_integration.without_proxy.create_bot')}
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
                {/* eslint-disable-next-line react/no-danger */}
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
                value={slackBotToken || ''}
                onChange={e => setSlackBotToken(e.target.value)}
              />
            </td>
            <td>
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
            </td>

          </tr>
        </tbody>
      </table>


      <AdminUpdateButtonRow onClick={updateHandler} disabled={false} />
    </>
  );
};

const CustomBotWithoutProxySettingsWrapper = withUnstatedContainers(CustomBotWithoutProxySettings, [AppContainer, AdminAppContainer]);

CustomBotWithoutProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default CustomBotWithoutProxySettingsWrapper;
