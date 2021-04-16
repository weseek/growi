import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Collapse } from 'reactstrap';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import CustomBotWithoutProxySecretTokenSection from './CustomBotWithoutProxySecretTokenSection';

export const botInstallationStep = {
  CREATE_BOT: 'create-bot',
  INSTALL_BOT: 'install-bot',
  REGISTER_SLACK_CONFIGURATION: 'register-slack-configuration',
  CONNECTION_TEST: 'connection-test',
};

const CustomBotWithoutProxySettingsAccordion = ({ appContainer, adminAppContainer, activeStep }) => {
  const { t } = useTranslation('admin');
  const [openAccordionIndexes, setOpenAccordionIndexes] = useState(new Set([activeStep]));
  const [connectionErrorCode, setConnectionErrorCode] = useState(null);
  const [connectionErrorMessage, setConnectionErrorMessage] = useState(null);
  const [connectionSuccessMessage, setConnectionSuccessMessage] = useState(null);
  const [testChannel, setTestChannel] = useState('');
  const [slackSigningSecret, setSlackSigningSecret] = useState('');
  const [slackBotToken, setSlackBotToken] = useState('');
  const [slackSigningSecretEnv, setSlackSigningSecretEnv] = useState('');
  const [slackBotTokenEnv, setSlackBotTokenEnv] = useState('');
  const currentBotType = 'custom-bot-without-proxy';

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


  const onToggleAccordionHandler = (installationStep) => {
    const accordionIndexes = new Set(openAccordionIndexes);
    if (accordionIndexes.has(installationStep)) {
      accordionIndexes.delete(installationStep);
    }
    else {
      accordionIndexes.add(installationStep);
    }
    setOpenAccordionIndexes(accordionIndexes);
  };

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
      <div className="card border-0 rounded-lg mb-0">
        <div
          className="card-header font-weight-normal py-3 d-flex justify-content-between"
          role="button"
          onClick={() => onToggleAccordionHandler(botInstallationStep.CREATE_BOT)}
        >
          <p className="mb-0 text-primary"><span className="mr-2">①</span>{t('slack_integration.without_proxy.create_bot')}</p>
          {openAccordionIndexes.has(botInstallationStep.CREATE_BOT)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={openAccordionIndexes.has(botInstallationStep.CREATE_BOT)}>
          <div className="card-body">

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
          </div>
        </Collapse>
      </div>

      <div className="card border-0 rounded-lg mb-0">
        <div
          className="card-header font-weight-normal py-3 d-flex justify-content-between"
          role="button"
          onClick={() => onToggleAccordionHandler(botInstallationStep.INSTALL_BOT)}
        >
          <p className="mb-0 text-primary"><span className="mr-2">②</span>{t('slack_integration.without_proxy.install_bot_to_slack')}</p>
          {openAccordionIndexes.has(botInstallationStep.INSTALL_BOT)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={openAccordionIndexes.has(botInstallationStep.INSTALL_BOT)}>
          <div className="card-body py-5">
            <div className="container w-75">
              <p>1. Install your app をクリックします。</p>
              <img src="/images/slack-integration/slack-bot-install-your-app-introduction.png" className="border border-light img-fluid mb-5" />
              <p>2. Install to Workspace をクリックします。</p>
              <img src="/images/slack-integration/slack-bot-install-to-workspace.png" className="border border-light img-fluid mb-5" />
              <p>3. 遷移先の画面にて、Allowをクリックします。</p>
              <img src="/images/slack-integration/slack-bot-install-your-app-transition-destination.png" className="border border-light img-fluid mb-5" />
              <p>4. Install your app の右側に 緑色のチェックがつけばワークスペースへのインストール完了です。</p>
              <img src="/images/slack-integration/slack-bot-install-your-app-complete.png" className="border border-light img-fluid mb-5" />
              <p>5. GROWI bot を使いたいチャンネルに @example を使用して招待します。</p>
              <img src="/images/slack-integration/slack-bot-install-to-workspace-joined-bot.png" className="border border-light img-fluid mb-1" />
              <img src="/images/slack-integration/slack-bot-install-your-app-introduction-to-channel.png" className="border border-light img-fluid" />
            </div>
          </div>
        </Collapse>
      </div>

      <div className="card border-0 rounded-lg mb-0">
        <div
          className="card-header font-weight-normal py-3 d-flex justify-content-between"
          role="button"
          onClick={() => onToggleAccordionHandler(botInstallationStep.REGISTER_SLACK_CONFIGURATION)}
        >
          <p className="mb-0 text-primary"><span className="mr-2">③</span>{t('slack_integration.without_proxy.register_secret_and_token')}</p>
          {openAccordionIndexes.has(botInstallationStep.REGISTER_SLACK_CONFIGURATION)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={openAccordionIndexes.has(botInstallationStep.REGISTER_SLACK_CONFIGURATION)}>
          <CustomBotWithoutProxySecretTokenSection
            updateSecretTokenHandler={updateSecretTokenHandler}
            onChangeSigningSecretHandler={onChangeSigningSecretHandler}
            onChangeBotTokenHandler={onChangeBotTokenHandler}
            slackSigningSecret={slackSigningSecret}
            slackSigningSecretEnv={slackSigningSecretEnv}
            slackBotToken={slackBotToken}
            slackBotTokenEnv={slackBotTokenEnv}
          />
        </Collapse>
      </div>

      <div className="card border-0 rounded-lg mb-0">
        <div
          className="card-header font-weight-normal py-3 d-flex justify-content-between"
          role="button"
          onClick={() => onToggleAccordionHandler(botInstallationStep.CONNECTION_TEST)}
        >
          <p className="mb-0 text-primary"><span className="mr-2">④</span>{t('slack_integration.without_proxy.test_connection')}</p>
          {openAccordionIndexes.has(botInstallationStep.CONNECTION_TEST)
            ? <i className="fa fa-chevron-up" />
            : <i className="fa fa-chevron-down" />
          }
        </div>
        <Collapse isOpen={openAccordionIndexes.has(botInstallationStep.CONNECTION_TEST)}>
          <div className="card-body">
            <p className="text-center m-4">以下のテストボタンを押して、Slack連携が完了しているかの確認をしましょう</p>
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
            {connectionErrorMessage != null
              && <p className="text-danger text-center m-4">エラーが発生しました。下記のログを確認してください。</p>
            }
            {connectionSuccessMessage != null
              && <p className="text-info text-center m-4">Slack ワークスペースに送信しました。</p>
            }
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
          </div>
        </Collapse>
      </div>
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
