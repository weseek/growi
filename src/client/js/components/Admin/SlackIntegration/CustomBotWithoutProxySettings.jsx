import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
// import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import CustomBotWithoutProxySettingsAccordion, { botInstallationStep } from './CustomBotWithoutProxySettingsAccordion';
import CustomBotWithoutProxyConnectionStatus from './CustomBotWithoutProxyConnectionStatus';
// import { addLogs } from './slak-integration-util';

const CustomBotWithoutProxySettings = (props) => {
  const { appContainer, connectionStatuses } = props;
  const { t } = useTranslation();

  const [siteName, setSiteName] = useState('');
  // const [isLatestConnectionSuccess, setIsLatestConnectionSuccess] = useState(false);
  // const [latestConnectionMessage, setLatestConnectionMessage] = useState(null);
  // const [testChannel, setTestChannel] = useState('');

  // const testConnection = async() => {
  //   try {
  //     await appContainer.apiv3.post('/slack-integration-settings/without-proxy/test', { channel: testChannel });
  //     setIsLatestConnectionSuccess(true);
  //     if (onTestConnectionInvoked != null) {
  //       onTestConnectionInvoked();
  //     }
  //   }
  //   catch (err) {
  //     setIsLatestConnectionSuccess(false);
  //     setLatestConnectionMessage(addLogs(latestConnectionMessage, err[0].message, err[0].code));
  //   }
  // };

  // const inputTestChannelHandler = (channel) => {
  //   setTestChannel(channel);
  // };

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
          // isLatestConnectionSuccess={isLatestConnectionSuccess}
          // latestConnectionMessage={latestConnectionMessage}
          // testChannel={testChannel}
          // onTestFormSubmitted={testConnection}
          // inputTestChannelHandler={inputTestChannelHandler}
        />
      </div>
    </>
  );
};

const CustomBotWithoutProxySettingsWrapper = withUnstatedContainers(CustomBotWithoutProxySettings, [AppContainer]);

CustomBotWithoutProxySettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  // adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,

  slackSigningSecret: PropTypes.string,
  slackSigningSecretEnv: PropTypes.string,
  slackBotToken: PropTypes.string,
  slackBotTokenEnv: PropTypes.string,

  connectionStatuses: PropTypes.object.isRequired,
  // onTestConnectionInvoked: PropTypes.func,
};

export default CustomBotWithoutProxySettingsWrapper;
