import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import CustomBotWithoutProxySettingsAccordion, { botInstallationStep } from './CustomBotWithoutProxySettingsAccordion';
import CustomBotWithoutProxyIntegrationCard from './CustomBotWithoutProxyIntegrationCard';
import DeleteSlackCredentialsModal from './DeleteSlackCredentialsModal';

const CustomBotWithoutProxySettings = (props) => {
  const { appContainer, isSetupSlackBot } = props;
  const { t } = useTranslation();

  const [siteName, setSiteName] = useState('');


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
        isSetupSlackBot={props.isSetupSlackBot}
      />

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_settings')}</h2>

      {isSetupSlackBot && (
      <btn
        className="pull-right btn text-danger border-danger"
        type="button"
      >リセット
      </btn>
      ) }
      <div className="my-5 mx-3">
        <CustomBotWithoutProxySettingsAccordion
          {...props}
          activeStep={botInstallationStep.CREATE_BOT}
        />
      </div>
      <DeleteSlackCredentialsModal />
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
  isConnectedToSlack: PropTypes.bool,
  isSetupSlackBot: PropTypes.bool,
  slackWSNameInWithoutProxy: PropTypes.string,
};

export default CustomBotWithoutProxySettingsWrapper;
