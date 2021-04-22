import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import CustomBotWithoutProxySettingsAccordion, { botInstallationStep } from './CustomBotWithoutProxySettingsAccordion';
import CustomBotWithouProxySettomgSlackCard from './CustomBotWithouProxySettingsCard';

const CustomBotWithoutProxySettings = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation();

  const [slackWorkSpaceName, setSlackWorkSpaceName] = useState(null);

  const [siteName, setSiteName] = useState('');

  const fetchSlackWorkSpaceName = useCallback(async() => {
    try {
      const res = await appContainer.apiv3.get('/slack-integration/custom-bot-without-proxy/slack-workspace-name');
      setSlackWorkSpaceName(res.data.slackWorkSpaceName);
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer.apiv3]);

  useEffect(() => {

    const siteName = appContainer.config.crowi.title;
    setSiteName(siteName);

    if (props.isSetupSlackBot) {
      fetchSlackWorkSpaceName();
    }
  }, [appContainer, fetchSlackWorkSpaceName, props.isSetupSlackBot]);

  return (
    <>

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_integration')}</h2>

      <CustomBotWithouProxySettomgSlackCard
        currentBotType={props.currentBotType}
        siteName={siteName}
        slackWorkSpaceName={slackWorkSpaceName}
        isSetupSlackBot={props.isSetupSlackBot}
      />

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_settings')}</h2>

      <div className="my-5 mx-3">
        <CustomBotWithoutProxySettingsAccordion
          {...props}
          activeStep={botInstallationStep.CREATE_BOT}
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
  isConnectedToSlack: PropTypes.bool,
  isSetupSlackBot: PropTypes.bool,
};

export default CustomBotWithoutProxySettingsWrapper;
