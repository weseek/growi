import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import CustomBotWithoutProxySettingsAccordion, { botInstallationStep } from './CustomBotWithoutProxySettingsAccordion';
import CustomBotWithoutProxyConnectionStatus from './CustomBotWithoutProxyConnectionStatus';

const CustomBotWithoutProxySettings = (props) => {
  const { appContainer, connectionStatuses } = props;
  const { t } = useTranslation();

  const [siteName, setSiteName] = useState('');
  const [isIntegrationSuccess, setIsIntegrationSuccess] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [connectionErrorCode, setConnectionErrorCode] = useState(null);
  const [testChannel, setTestChannel] = useState('');

  const testConnection = async() => {
    try {
      await appContainer.apiv3.post('/slack-integration-settings/without-proxy/test', { channel: testChannel });
      setConnectionMessage('Send the message to slack work space.');
      setIsIntegrationSuccess(true);
    }
    catch (err) {
      setConnectionErrorCode(err[0].code);
      setConnectionMessage(err[0].message);
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

  const workspaceName = connectionStatuses[props.slackBotToken]?.workspaceName;

  return (

    <>
      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_integration')}
        {/* TODO: add an appropriate links by GW-5614 */}
        <i className="fa fa-external-link btn-link ml-2" aria-hidden="true"></i>
      </h2>

      <CustomBotWithoutProxyConnectionStatus
        siteName={siteName}
        connectionStatuses={connectionStatuses}
      />

      <h2 className="admin-setting-header">{t('admin:slack_integration.integration_procedure')}</h2>

      <div className="px-3">
        <div className="my-3 d-flex align-items-center justify-content-between">
          <h2 id={props.slackBotToken || 'settings-accordions'}>
            {(workspaceName != null) ? `${workspaceName} Work Space` : 'Settings'}
          </h2>
        </div>
        <CustomBotWithoutProxySettingsAccordion
          {...props}
          activeStep={botInstallationStep.CREATE_BOT}
          connectionMessage={connectionMessage}
          connectionErrorCode={connectionErrorCode}
          isIntegrationSuccess={isIntegrationSuccess}
          testChannel={testChannel}
          onTestFormSubmitted={testConnection}
          inputTestChannelHandler={inputTestChannelHandler}
        />
      </div>
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
  connectionStatuses: PropTypes.object.isRequired,
};

export default CustomBotWithoutProxySettingsWrapper;
