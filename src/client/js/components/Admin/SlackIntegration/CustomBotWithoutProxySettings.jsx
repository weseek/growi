import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import SlackGrowiBridging from './SlackGrowiBridging';
import CustomBotWithoutProxySettingsAccordion from './CustomBotWithoutProxySettingsAccordion';


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
  // eslint-disable-next-line no-unused-vars
  const [isSetupSlackBot, setIsSetupSlackBot] = useState(null);
  const [isConnectedToSlack, setIsConnectedToSlack] = useState(null);
  const currentBotType = 'custom-bot-without-proxy';

  useEffect(() => {
    const fetchData = async() => {
      try {
        const res = await appContainer.apiv3.get('/slack-integration/custom-bot-without-proxy/slack-workspace-name');
        setSlackWSNameInWithoutProxy(res.data.slackWorkSpaceName);
      }
      catch (err) {
        toastError(err);
      }
    };
    setSlackWSNameInWithoutProxy(null);
    if (isConnectedToSlack) {
      fetchData();
    }
  }, [appContainer, isConnectedToSlack]);

  const fetchData = useCallback(async() => {
    try {
      await adminAppContainer.retrieveAppSettingsData();
      const res = await appContainer.apiv3.get('/slack-integration/');
      const {
        slackSigningSecret, slackBotToken, slackSigningSecretEnvVars, slackBotTokenEnvVars, isSetupSlackBot, isConnectedToSlack,
      } = res.data.slackBotSettingParams.customBotWithoutProxySettings;
      setSlackSigningSecret(slackSigningSecret);
      setSlackBotToken(slackBotToken);
      setSlackSigningSecretEnv(slackSigningSecretEnvVars);
      setSlackBotTokenEnv(slackBotTokenEnvVars);
      setSiteName(adminAppContainer.state.title);
      setIsSetupSlackBot(isSetupSlackBot);
      setIsConnectedToSlack(isConnectedToSlack);
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
      fetchData();
      toastSuccess(t('toaster.update_successed', { target: t('admin:slack_integration.custom_bot_without_proxy_settings') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  return (
    <>

      {/* ----------------  start --------------- */}

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_integration')}</h2>

      <div className="d-flex justify-content-center my-4">

        {/* カード１ */}
        <div className="card rounded-lg shadow border-0 w-50">
          <h5 className="card-title m-2">Slack</h5>
          <div className="card-body p-5"></div>
        </div>

        {/* 破線 */}
        <div className="w-25 border-danger align-self-center" style={{ border: "dashed" }}></div>

        {/* カード２ */}
        <div className="card rounded-lg shadow border-0 w-50">
          <h5 className="card-title m-2">GROWI App</h5>
          <div className="card-body p-5"></div>
        </div>

      </div>

      {/* ----------------   end  --------------- */}

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_settings')}</h2>
      {/* temporarily put bellow component */}
      <SlackGrowiBridging
        siteName={siteName}
        slackWorkSpaceName={slackWSNameInWithoutProxy}
      />
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

      <div className="my-5 mx-3">
        <CustomBotWithoutProxySettingsAccordion />
      </div>

    </>
  );
};

const CustomBotWithoutProxySettingsWrapper = withUnstatedContainers(CustomBotWithoutProxySettings, [AppContainer, AdminAppContainer]);

CustomBotWithoutProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default CustomBotWithoutProxySettingsWrapper;
