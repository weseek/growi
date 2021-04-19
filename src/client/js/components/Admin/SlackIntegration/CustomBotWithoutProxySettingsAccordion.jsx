import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import Accordion from '../Common/Accordion';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import CustomBotWithoutProxySecretTokenSection from './CustomBotWithoutProxySecretTokenSection';

export const botInstallationStep = {
  CREATE_BOT: 'create-bot',
  INSTALL_BOT: 'install-bot',
  REGISTER_SLACK_CONFIGURATION: 'register-slack-configuration',
  CONNECTION_TEST: 'connection-test',
};

const CustomBotWithoutProxySettingsAccordion = ({ appContainer, adminAppContainer, activeStep }) => {
  const { t } = useTranslation();
  // TODO: GW-5644 Store default open accordion
  // eslint-disable-next-line no-unused-vars
  const [defaultOpenAccordionKeys, setDefaultOpenAccordionKeys] = useState(new Set([activeStep]));
  const [connectionErrorCode, setConnectionErrorCode] = useState(null);
  const [connectionErrorMessage, setConnectionErrorMessage] = useState(null);
  const [connectionSuccessMessage, setConnectionSuccessMessage] = useState(null);
  const [testChannel, setTestChannel] = useState('');
  const [slackSigningSecret, setSlackSigningSecret] = useState('');
  const [slackBotToken, setSlackBotToken] = useState('');
  const [slackSigningSecretEnv, setSlackSigningSecretEnv] = useState('');
  const [slackBotTokenEnv, setSlackBotTokenEnv] = useState('');
  const currentBotType = 'customBotWithoutProxy';

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
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer, adminAppContainer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateSecretTokenHandler = async() => {
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
  };

  const onChangeSigningSecretHandler = (signingSecretInput) => {
    setSlackSigningSecret(signingSecretInput);
  };

  const onChangeBotTokenHandler = (botTokenInput) => {
    setSlackBotToken(botTokenInput);
  };

  const onTestConnectionHandler = async() => {
    setConnectionErrorCode(null);
    setConnectionErrorMessage(null);
    setConnectionSuccessMessage(null);
    try {
      const res = await appContainer.apiv3.post('slack-integration/notification-test-to-slack-work-space', {
        channel: testChannel,
      });
      setConnectionSuccessMessage(res.data.message);
    }
    catch (err) {
      setConnectionErrorCode(err[0].code);
      setConnectionErrorMessage(err[0].message);
    }
  };

  const inputTestChannelHandler = (channel) => {
    setTestChannel(channel);
  };

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.CREATE_BOT)}
        title={<><span className="mr-2">①</span>{t('admin:slack_integration.without_proxy.create_bot')}</>}
      >
        <div className="row my-5">
          <div className="mx-auto">
            <div>
              <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
                {t('admin:slack_integration.without_proxy.create_bot')}
                <i className="fa fa-external-link ml-2" aria-hidden="true" />
              </button>
            </div>
            {/* TODO: Insert DOCS link */}
            <a href="#">
              <p className="text-center mt-1">
                <small>
                  {t('admin:slack_integration.without_proxy.how_to_create_a_bot')}
                  <i className="fa fa-external-link ml-2" aria-hidden="true" />
                </small>
              </p>
            </a>
          </div>
        </div>
      </Accordion>
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.INSTALL_BOT)}
        title={<><span className="mr-2">②</span>{t('admin:slack_integration.without_proxy.install_bot_to_slack')}</>}
      >
        <div className="container w-75 py-5">
          <p>1. {t('admin:slack_integration.without_proxy.select_install_your_app')}</p>
          <img src="/images/slack-integration/slack-bot-install-your-app-introduction.png" className="border border-light img-fluid mb-5" />
          <p>2. {t('admin:slack_integration.without_proxy.select_install_to_workspace')}</p>
          <img src="/images/slack-integration/slack-bot-install-to-workspace.png" className="border border-light img-fluid mb-5" />
          <p>3. {t('admin:slack_integration.without_proxy.click_allow')}</p>
          <img src="/images/slack-integration/slack-bot-install-your-app-transition-destination.png" className="border border-light img-fluid mb-5" />
          <p>4. {t('admin:slack_integration.without_proxy.install_complete_if_checked')}</p>
          <img src="/images/slack-integration/slack-bot-install-your-app-complete.png" className="border border-light img-fluid mb-5" />
          <p>5. {t('admin:slack_integration.without_proxy.invite_bot_to_channel')}</p>
          <img src="/images/slack-integration/slack-bot-install-to-workspace-joined-bot.png" className="border border-light img-fluid mb-1" />
          <img src="/images/slack-integration/slack-bot-install-your-app-introduction-to-channel.png" className="border border-light img-fluid" />
        </div>
      </Accordion>
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.REGISTER_SLACK_CONFIGURATION)}
        title={<><span className="mr-2">③</span>{t('admin:slack_integration.without_proxy.register_secret_and_token')}</>}
      >
        <CustomBotWithoutProxySecretTokenSection
          updateSecretTokenHandler={updateSecretTokenHandler}
          onChangeSigningSecretHandler={onChangeSigningSecretHandler}
          onChangeBotTokenHandler={onChangeBotTokenHandler}
          slackSigningSecret={slackSigningSecret}
          slackSigningSecretEnv={slackSigningSecretEnv}
          slackBotToken={slackBotToken}
          slackBotTokenEnv={slackBotTokenEnv}
        />
      </Accordion>
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.CONNECTION_TEST)}
        title={<><span className="mr-2">④</span>{t('admin:slack_integration.without_proxy.test_connection')}</>}
      >
        <p className="text-center m-4">{t('admin:slack_integration.without_proxy.test_connection_by_pressing_button')}</p>
        <div className="d-flex justify-content-center">
          <form className="form-row align-items-center w-25">
            <div className="col-8">
              <input
                className="form-control"
                type="text"
                value={testChannel}
                placeholder="eg. general"
                onChange={e => inputTestChannelHandler(e.target.value)}
              />
            </div>
            <div className="col-4">
              <button
                type="button"
                className="btn btn-info m-3 font-weight-bold"
                onClick={onTestConnectionHandler}
              >Test
              </button>
            </div>
          </form>
        </div>
        {connectionErrorMessage != null && <p className="text-danger text-center m-4">{t('admin:slack_integration.without_proxy.error_check_logs_below')}</p>}
        {connectionSuccessMessage != null && <p className="text-info text-center m-4">Slack ワークスペースに送信しました。</p>}
        <form>
          <div className="row m-3 justify-content-center">
            <div className="form-group slack-connection-log w-25">
              <label><p className="border-info slack-connection-log-title mb-1 pl-2">Logs</p></label>
              {connectionErrorMessage == null && connectionSuccessMessage == null && (
                <textarea className="form-control card border-info slack-connection-log-body rounded-lg pl-3" />
              )}
              {connectionErrorMessage != null && (
                <textarea
                  className="form-control card border-info slack-connection-log-body rounded-lg pl-3"
                  multiple
                  value={[connectionErrorCode, connectionErrorMessage]}
                />
              )}
              {connectionSuccessMessage != null && (
                <textarea
                  className="form-control card border-info slack-connection-log-body rounded-lg pl-2"
                  multiple
                  value={connectionSuccessMessage}
                />
              )}
            </div>
          </div>
        </form>
      </Accordion>
    </div>
  );
};

const CustomBotWithoutProxySettingsAccordionWrapper = withUnstatedContainers(CustomBotWithoutProxySettingsAccordion, [AppContainer, AdminAppContainer]);

CustomBotWithoutProxySettingsAccordion.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
  activeStep: PropTypes.oneOf(Object.values(botInstallationStep)).isRequired,
};

export default CustomBotWithoutProxySettingsAccordionWrapper;
