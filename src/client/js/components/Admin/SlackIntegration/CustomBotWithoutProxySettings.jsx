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
  const {
    appContainer, adminAppContainer, slackBotToken, slackBotTokenEnv, slackSigningSecret, slackSigningSecretEnv,
  } = props;
  const { t } = useTranslation();

  const [slackWSNameInWithoutProxy, setSlackWSNameInWithoutProxy] = useState(null);
  const [isRgisterSlackCredentials, setIsRgisterSlackCredentials] = useState(false);

  // get site name from this GROWI
  // eslint-disable-next-line no-unused-vars
  const [siteName, setSiteName] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [isSetupSlackBot, setIsSetupSlackBot] = useState(null);
  const [isConnectedToSlack, setIsConnectedToSlack] = useState(null);
  const [isSendTestMessage, setIsSendTestMessage] = useState(false);

  // const fetchData = useCallback(async() => {
  //   try {
  //     await adminAppContainer.retrieveAppSettingsData();
  //     const res = await appContainer.apiv3.get('/slack-integration/');
  //     const { isSetupSlackBot, isConnectedToSlack } = res.data.slackBotSettingParams.customBotWithoutProxySettings;
  //     setSiteName(adminAppContainer.state.title);
  //     setIsSetupSlackBot(isSetupSlackBot);
  //     setIsConnectedToSlack(isConnectedToSlack);
  //     setIsRgisterSlackCredentials(false);
  //     if ((slackBotToken && slackSigningSecret) || (slackBotTokenEnv && slackSigningSecretEnv)) {
  //       setIsRgisterSlackCredentials(true);
  //     }
  //   }
  //   catch (err) {
  //     toastError(err);
  //   }
  // }, [appContainer, adminAppContainer, slackSigningSecretEnv, slackBotTokenEnv]);

  useEffect(() => {
    const getSlackWorkSpaceName = async() => {
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
      getSlackWorkSpaceName();
    }
    fetchData();
  }, [appContainer, isConnectedToSlack, fetchData]);

  return (
    <>

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_integration')}</h2>

      <div className="d-flex justify-content-center my-5 bot-integration">
        <div className="card rounded shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold mt-3 ml-4">Slack</h5>
          <div className="card-body p-4"></div>
        </div>

        <div className="text-center w-25 mt-4">
          <p className="text-secondary m-0"><small>{t('admin:slack_integration.integration_sentence.integration_is_not_complete')}</small></p>
          <p className="text-secondary"><small>{t('admin:slack_integration.integration_sentence.proceed_with_the_following_integration_procedure')}</small></p>
          <hr className="border-danger align-self-center admin-border"></hr>
        </div>

        <div className="card rounded-lg shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold mt-3 ml-4">GROWI App</h5>
          <div className="card-body p-4 text-center">
            <a className="btn btn-primary mb-5">WESEEK Inner Wiki</a>
          </div>
        </div>
      </div>

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_settings')}</h2>
      {/* temporarily put bellow component */}
      <SlackGrowiBridging
        siteName={siteName}
        slackWorkSpaceName={slackWSNameInWithoutProxy}
      />

      <div className="my-5 mx-3">
        <CustomBotWithoutProxySettingsAccordion
          activeStep={botInstallationStep.CREATE_BOT}
          isRgisterSlackCredentials={isRgisterSlackCredentials}
          isSendTestMessage={isSendTestMessage}
          setIsSendTestMessage={setIsSendTestMessage}
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
};

export default CustomBotWithoutProxySettingsWrapper;
