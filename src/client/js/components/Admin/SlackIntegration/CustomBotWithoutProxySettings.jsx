import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import CustomBotWithoutProxySettingsAccordion, { botInstallationStep } from './CustomBotWithoutProxySettingsAccordion';

const CustomBotWithoutProxySettings = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation();

  const [slackWSNameInWithoutProxy, setSlackWSNameInWithoutProxy] = useState(null);

  const [siteName, setSiteName] = useState('');

  const fetchSlackWorkSpaceName = async() => {
    try {
      const res = await appContainer.apiv3.get('/slack-integration/custom-bot-without-proxy/slack-workspace-name');
      setSlackWSNameInWithoutProxy(res.data.slackWorkSpaceName);
    }
    catch (err) {
      toastError(err);
    }
  };

  const fetchSiteName = () => {
    const siteName = appContainer.config.crowi.title;
    setSiteName(siteName);
  };

  useEffect(() => {
    fetchSiteName();
    if (props.isSetupSlackBot) {
      fetchSlackWorkSpaceName();
    }
  }, [appContainer, props.isSetupSlackBot]);

  return (
    <>

      <h2 className="admin-setting-header">{t('admin:slack_integration.custom_bot_without_proxy_integration')}</h2>

      <div className="d-flex justify-content-center my-5 bot-integration">
        <div className="card rounded shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold mt-3 ml-4">Slack</h5>
          <div className="card-body p-2 w-50 mx-auto">
            {slackWSNameInWithoutProxy && (
              <div className="card p-20 slack-work-space-name-card">
                <div className="m-2 text-center">
                  <h5 className="font-weight-bold">{ slackWSNameInWithoutProxy }</h5>
                  <img width={20} height={20} src="/images/slack-integration/growi-bot-kun-icon.png" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center w-25">
          {props.isSetupSlackBot && (
            <div className="mt-5">
              <p className="text-success"><small className="fa fa-check"> {t('admin:slack_integration.integration_sentence.integration_sucessed')}</small></p>
              <hr className="align-self-center admin-border-success"></hr>
            </div>
          )}
          {!props.isSetupSlackBot && (
            <div className="mt-4">
              {t('admin:slack_integration.integration_sentence.integration_is_not_complete').split('\n').map(str => {
                return <p className="text-secondary m-0"><small>{str}</small></p>
              })}
              <hr className="align-self-center admin-border-danger"></hr>
            </div>
          )}
        </div>

        <div className="card rounded-lg shadow border-0 w-50 admin-bot-card">
          <h5 className="card-title font-weight-bold mt-3 ml-4">GROWI App</h5>
          <div className="card-body p-4 mb-5 text-center">
            <div className="btn btn-primary">{ siteName }</div>
          </div>
        </div>
      </div>

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
