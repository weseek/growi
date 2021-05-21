import React, { useState } from 'react';
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

const CustomBotWithoutProxySettingsAccordion = ({
  appContainer, activeStep, fetchSlackIntegrationData,
  slackSigningSecret, slackSigningSecretEnv, slackBotToken, slackBotTokenEnv,
  isRegisterSlackCredentials, isSendTestMessage,
  onSetSlackSigningSecret, onSetSlackBotToken, onSetIsSendTestMessage,
}) => {
  const { t } = useTranslation();
  // TODO: GW-5644 Store default open accordion
  // eslint-disable-next-line no-unused-vars
  const [defaultOpenAccordionKeys, setDefaultOpenAccordionKeys] = useState(new Set([activeStep]));
  const [connectionErrorCode, setConnectionErrorCode] = useState(null);
  const [connectionErrorMessage, setConnectionErrorMessage] = useState(null);
  const [connectionSuccessMessage, setConnectionSuccessMessage] = useState(null);
  const [testChannel, setTestChannel] = useState('');
  const currentBotType = 'customBotWithoutProxy';


  const updateSecretTokenHandler = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/without-proxy/update-settings', {
        slackSigningSecret,
        slackBotToken,
        currentBotType,
      });

      if (fetchSlackIntegrationData == null) {
        return null;
      }
      fetchSlackIntegrationData();
      toastSuccess(t('toaster.update_successed', { target: t('admin:slack_integration.custom_bot_without_proxy_settings') }));
    }
    catch (err) {
      toastError(err);
    }
  };

  const onChangeSigningSecretHandler = (signingSecretInput) => {
    if (onSetSlackSigningSecret != null) {
      onSetSlackSigningSecret(signingSecretInput);
    }
  };

  const onChangeBotTokenHandler = (botTokenInput) => {
    if (onSetSlackBotToken != null) {
      onSetSlackBotToken(botTokenInput);
    }
  };

  const testConnection = async() => {
    setConnectionErrorCode(null);
    setConnectionErrorMessage(null);
    setConnectionSuccessMessage(null);
    // TODO: 5921 Add new Test endpoint
    try {
      // eslint-disable-next-line no-console
      console.log('Test');
      // const res = await appContainer.apiv3.post('/slack-integration-settings/notification-test-to-slack-work-space', {
      //   channel: testChannel,
      // });
      // setConnectionSuccessMessage(res.data.message);
      // onSetIsSendTestMessage(true);
    }
    catch (err) {
      onSetIsSendTestMessage(false);
      setConnectionErrorCode('dummy-error-code');
      setConnectionErrorMessage('This is a sample error message');
    }
  };

  const submitForm = (e) => {
    e.preventDefault();
    testConnection();
  };

  const inputTestChannelHandler = (channel) => {
    setTestChannel(channel);
  };

  let value = '';
  if (connectionErrorMessage != null) {
    value = [connectionErrorCode, connectionErrorMessage];
  }
  if (connectionSuccessMessage != null) {
    value = connectionSuccessMessage;
  }

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.CREATE_BOT)}
        title={<><span className="mr-2">①</span>{t('admin:slack_integration.accordion.create_bot')}</>}
      >
        <div className="my-5 d-flex flex-column align-items-center">
          <button type="button" className="btn btn-primary text-nowrap" onClick={() => window.open('https://api.slack.com/apps', '_blank')}>
            {t('admin:slack_integration.accordion.create_bot')}
            <i className="fa fa-external-link ml-2" aria-hidden="true" />
          </button>
          {/* TODO: Insert DOCS link */}
          <a href="#">
            <p className="text-center mt-1">
              <small>
                {t('admin:slack_integration.accordion.how_to_create_a_bot')}
                <i className="fa fa-external-link ml-2" aria-hidden="true" />
              </small>
            </p>
          </a>
        </div>
      </Accordion>
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.INSTALL_BOT)}
        title={<><span className="mr-2">②</span>{t('admin:slack_integration.accordion.install_bot_to_slack')}</>}
      >
        <div className="container w-75 py-5">
          <p>1. {t('admin:slack_integration.accordion.select_install_your_app')}</p>
          <img src="/images/slack-integration/slack-bot-install-your-app-introduction.png" className="border border-light img-fluid mb-5" />
          <p>2. {t('admin:slack_integration.accordion.select_install_to_workspace')}</p>
          <img src="/images/slack-integration/slack-bot-install-to-workspace.png" className="border border-light img-fluid mb-5" />
          <p>3. {t('admin:slack_integration.accordion.click_allow')}</p>
          <img src="/images/slack-integration/slack-bot-install-your-app-transition-destination.png" className="border border-light img-fluid mb-5" />
          <p>4. {t('admin:slack_integration.accordion.install_complete_if_checked')}</p>
          <img src="/images/slack-integration/slack-bot-install-your-app-complete.png" className="border border-light img-fluid mb-5" />
          <p>5. {t('admin:slack_integration.accordion.invite_bot_to_channel')}</p>
          <img src="/images/slack-integration/slack-bot-install-to-workspace-joined-bot.png" className="border border-light img-fluid mb-1" />
          <img src="/images/slack-integration/slack-bot-install-your-app-introduction-to-channel.png" className="border border-light img-fluid" />
        </div>
      </Accordion>
      <Accordion
        defaultIsActive={defaultOpenAccordionKeys.has(botInstallationStep.REGISTER_SLACK_CONFIGURATION)}
        // eslint-disable-next-line max-len
        title={<><span className="mr-2">③</span>{t('admin:slack_integration.accordion.register_secret_and_token')}{isRegisterSlackCredentials && <i className="ml-3 text-success fa fa-check"></i>}</>}
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
        // eslint-disable-next-line max-len
        title={<><span className="mr-2">④</span>{t('admin:slack_integration.accordion.test_connection')}{isSendTestMessage && <i className="ml-3 text-success fa fa-check"></i>}</>}
      >
        <p className="text-center m-4">{t('admin:slack_integration.accordion.test_connection_by_pressing_button')}</p>
        <div className="d-flex justify-content-center">
          <form className="form-row align-items-center" onSubmit={e => submitForm(e)}>
            <div className="input-group col-8">
              <div className="input-group-prepend">
                <span className="input-group-text" id="slack-channel-addon"><i className="fa fa-hashtag" /></span>
              </div>
              <input
                className="form-control"
                type="text"
                value={testChannel}
                placeholder="Slack Channel"
                onChange={e => inputTestChannelHandler(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn btn-info mx-3 font-weight-bold"
              disabled={testChannel.trim() === ''}
            >Test
            </button>
          </form>
        </div>
        {connectionErrorMessage != null
          && <p className="text-danger text-center my-4">{t('admin:slack_integration.accordion.error_check_logs_below')}</p>}
        {connectionSuccessMessage != null
          && <p className="text-info text-center my-4">{t('admin:slack_integration.accordion.send_message_to_slack_work_space')}</p>}
        <form>
          <div className="row my-3 justify-content-center">
            <div className="form-group slack-connection-log col-md-4">
              <label className="mb-1"><p className="border-info slack-connection-log-title pl-2 m-0">Logs</p></label>
              <textarea
                className="form-control card border-info slack-connection-log-body rounded-lg"
                rows="5"
                value={value}
                readOnly
              />
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
  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,
  isRegisterSlackCredentials: PropTypes.bool,
  isSendTestMessage: PropTypes.bool,
  fetchSlackIntegrationData: PropTypes.func,
  onSetSlackSigningSecret: PropTypes.func,
  onSetSlackBotToken: PropTypes.func,
  onSetIsSendTestMessage: PropTypes.func,
  onSetIsRegisterSlackCredentials: PropTypes.func,
  setSlackWSNameInWithoutProxy: PropTypes.func,

  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
  activeStep: PropTypes.oneOf(Object.values(botInstallationStep)).isRequired,
};

export default CustomBotWithoutProxySettingsAccordionWrapper;
