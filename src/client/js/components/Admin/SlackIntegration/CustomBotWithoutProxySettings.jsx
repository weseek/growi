import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import CustomBotWithoutProxySettingsAccordion, { botInstallationStep } from './CustomBotWithoutProxySettingsAccordion';
import CustomBotWithoutProxyIntegrationCard from './CustomBotWithoutProxyIntegrationCard';
import DeleteSlackBotSettingsModal from './DeleteSlackBotSettingsModal';

const CustomBotWithoutProxySettings = (props) => {
  const { appContainer, onResetSettings, onSetIsSendTestMessage } = props;
  const { t } = useTranslation();

  const [siteName, setSiteName] = useState('');
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);
  const [isIntegrationSuccess, setIsIntegrationSuccess] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [connectionErrorCode, setConnectionErrorCode] = useState(null);
  const [testChannel, setTestChannel] = useState('');

  const resetSettings = async() => {
    if (onResetSettings == null) {
      return;
    }
    onResetSettings();
  };

  const testConnection = async() => {
    setConnectionErrorCode(null);
    setConnectionMessage(null);
    try {
      await appContainer.apiv3.post('/slack-integration-settings/without-proxy/test', { channel: testChannel });
      setConnectionMessage('Send the message to slack work space.');
      onSetIsSendTestMessage(true);
      setIsIntegrationSuccess(true);
    }
    catch (err) {
      setConnectionErrorCode(err[0].code);
      setConnectionMessage(err[0].message);
      onSetIsSendTestMessage(false);
      setIsIntegrationSuccess(false);
    }
  };

  const inputTestChannelHandler = (channel) => {
    setTestChannel(channel);
  };

  useEffect(() => {
    const siteName = appContainer.config.crowi.title;
    setSiteName(siteName);
  }, [appContainer]);

  return (
    <>
      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_integration')}</h2>

      <CustomBotWithoutProxyIntegrationCard
        siteName={siteName}
        slackWSNameInWithoutProxy={props.slackWSNameInWithoutProxy}
        isIntegrationSuccess={isIntegrationSuccess}
      />

      <h2 className="admin-setting-header">{t('admin:slack_integration.integration_procedure')}</h2>

      {(props.slackSigningSecret || props.slackBotToken) && (
      <button
        className="mx-3 pull-right btn text-danger border-danger"
        type="button"
        onClick={() => setIsDeleteConfirmModalShown(true)}
      >{t('admin:slack_integration.reset')}
      </button>
      )}

      <div className="my-5 mx-3">
        <CustomBotWithoutProxySettingsAccordion
          {...props}
          activeStep={botInstallationStep.CREATE_BOT}
          connectionMessage={connectionMessage}
          connectionErrorCode={connectionErrorCode}
          testChannel={testChannel}
          testConnection={testConnection}
          inputTestChannelHandler={inputTestChannelHandler}

        />
      </div>
      <DeleteSlackBotSettingsModal
        isResetAll={false}
        isOpen={isDeleteConfirmModalShown}
        onClose={() => setIsDeleteConfirmModalShown(false)}
        onClickDeleteButton={resetSettings}
      />
    </>
  );
};

const CustomBotWithoutProxySettingsWrapper = withUnstatedContainers(CustomBotWithoutProxySettings, [AppContainer, AdminAppContainer]);

CustomBotWithoutProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,
  isRgisterSlackCredentials: PropTypes.bool,
  isIntegrationSuccess: PropTypes.bool,
  slackWSNameInWithoutProxy: PropTypes.string,
  onResetSettings: PropTypes.func,
  onSetIsSendTestMessage: PropTypes.func,
};

export default CustomBotWithoutProxySettingsWrapper;
