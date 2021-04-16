import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import SlackGrowiBridging from './SlackGrowiBridging';
import CustomBotWithoutProxySettingsAccordion, { botInstallationStep } from './CustomBotWithoutProxySettingsAccordion';

const CustomBotWithoutProxySettings = (props) => {
  const { appContainer, adminAppContainer } = props;
  const { t } = useTranslation();

  const [slackWSNameInWithoutProxy, setSlackWSNameInWithoutProxy] = useState(null);
  // get site name from this GROWI
  // eslint-disable-next-line no-unused-vars
  const [siteName, setSiteName] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [isSetupSlackBot, setIsSetupSlackBot] = useState(null);
  const [isConnectedToSlack, setIsConnectedToSlack] = useState(null);

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
      const { isSetupSlackBot, isConnectedToSlack } = res.data.slackBotSettingParams.customBotWithoutProxySettings;
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

  return (
    <>
      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_settings')}</h2>
      {/* temporarily put bellow component */}
      <SlackGrowiBridging
        siteName={siteName}
        slackWorkSpaceName={slackWSNameInWithoutProxy}
      />

      <div className="my-5 mx-3">
        {/* TODO GW-5644 active create bot step temporary */}
        <CustomBotWithoutProxySettingsAccordion activeStep={botInstallationStep.CREATE_BOT} />
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
