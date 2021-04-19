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
    setSlackWSNameInWithoutProxy(null);
    if (isConnectedToSlack) {
      fetchSlackWorkSpaceName();
    }
  }, [appContainer, isConnectedToSlack]);

  const fetchSlackWorkSpaceName = async() => {
    try {
      const res = await appContainer.apiv3.get('/slack-integration/custom-bot-without-proxy/slack-workspace-name');
      setSlackWSNameInWithoutProxy(res.data.slackWorkSpaceName);
    }
    catch (err) {
      toastError(err);
    }
  };

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

  const reload  = (() => {
    fetchSlackWorkSpaceName();
  })

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
          <div className="row">
            <h5 className="card-title font-weight-bold mt-3 ml-4 col">GROWI App</h5>
            <div className="pull-right mt-3 mr-3">
              <a className="icon-fw fa fa-repeat fa-2x" onClick={ reload }></a>
            </div>
          </div>
          <div className="card-body p-4 text-center"> { slackWSNameInWithoutProxy && <a className="btn btn-primary mb-5">{ slackWSNameInWithoutProxy }</a>}
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
