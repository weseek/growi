import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import OfficialBotSettings from './OfficialBotSettings';
import CustomBotWithoutProxySettings from './CustomBotWithoutProxySettings';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';
import ConfirmBotChangeModal from './ConfirmBotChangeModal';
import BotTypeCard from './BotTypeCard';

const botTypes = ['officialBot', 'customBotWithoutProxy', 'customBotWithProxy'];

const SlackIntegration = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation();
  const [currentBotType, setCurrentBotType] = useState(null);
  const [selectedBotType, setSelectedBotType] = useState(null);
  const [slackSigningSecret, setSlackSigningSecret] = useState(null);
  const [slackBotToken, setSlackBotToken] = useState(null);
  const [slackSigningSecretEnv, setSlackSigningSecretEnv] = useState('');
  const [slackBotTokenEnv, setSlackBotTokenEnv] = useState('');
  const [isRegisterSlackCredentials, setIsRegisterSlackCredentials] = useState(false);
  const [isSendTestMessage, setIsSendTestMessage] = useState(false);
  const [slackWSNameInWithoutProxy, setSlackWSNameInWithoutProxy] = useState(null);

  const fetchSlackIntegrationData = useCallback(async() => {
    try {
      const { data } = await appContainer.apiv3.get('/slack-integration-settings');
      const {
        slackSigningSecret, slackBotToken, slackSigningSecretEnvVars, slackBotTokenEnvVars,
      } = data.settings;

      if (data.connectionStatuses != null) {
        const { workspaceName } = data.connectionStatuses[slackBotToken];
        setSlackWSNameInWithoutProxy(workspaceName);
      }

      setCurrentBotType(currentBotType);
      setSlackSigningSecret(slackSigningSecret);
      setSlackBotToken(slackBotToken);
      setSlackSigningSecretEnv(slackSigningSecretEnvVars);
      setSlackBotTokenEnv(slackBotTokenEnvVars);
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer.apiv3, currentBotType]);


  useEffect(() => {
    fetchSlackIntegrationData();
  }, [fetchSlackIntegrationData]);

  const handleBotTypeSelect = (clickedBotType) => {
    if (clickedBotType === currentBotType) {
      return;
    }
    if (currentBotType === null) {
      setCurrentBotType(clickedBotType);
      return;
    }
    setSelectedBotType(clickedBotType);
  };

  const cancelBotChangeHandler = () => {
    setSelectedBotType(null);
  };

  const changeCurrentBotSettingsHandler = async() => {
    try {
      const res = await appContainer.apiv3.put('/slack-integration-settings/custom-bot-without-proxy', {
        slackSigningSecret: '',
        slackBotToken: '',
        currentBotType: selectedBotType,
      });
      setCurrentBotType(res.data.customBotWithoutProxySettingParams.slackBotType);
      setSelectedBotType(null);
      toastSuccess(t('admin:slack_integration.bot_reset_successful'));
      setIsRegisterSlackCredentials(false);
      setSlackSigningSecret(null);
      setSlackBotToken(null);
      setIsSendTestMessage(false);
      setSlackWSNameInWithoutProxy(null);
    }
    catch (err) {
      toastError(err);
    }
  };

  let settingsComponent = null;

  switch (currentBotType) {
    case 'officialBot':
      settingsComponent = <OfficialBotSettings />;
      break;
    case 'customBotWithoutProxy':
      settingsComponent = (
        <CustomBotWithoutProxySettings
          isSendTestMessage={isSendTestMessage}
          isRegisterSlackCredentials={isRegisterSlackCredentials}
          slackBotTokenEnv={slackBotTokenEnv}
          slackBotToken={slackBotToken}
          slackSigningSecretEnv={slackSigningSecretEnv}
          slackSigningSecret={slackSigningSecret}
          slackWSNameInWithoutProxy={slackWSNameInWithoutProxy}
          onSetSlackSigningSecret={setSlackSigningSecret}
          onSetSlackBotToken={setSlackBotToken}
          onSetIsSendTestMessage={setIsSendTestMessage}
          fetchSlackIntegrationData={fetchSlackIntegrationData}
        />
      );
      break;
    case 'customBotWithProxy':
      settingsComponent = <CustomBotWithProxySettings />;
      break;
  }

  return (
    <>
      <ConfirmBotChangeModal
        isOpen={selectedBotType != null}
        onConfirmClick={changeCurrentBotSettingsHandler}
        onCancelClick={cancelBotChangeHandler}
      />

      <div className="selecting-bot-type mb-5">
        <h2 className="admin-setting-header mb-4">
          {t('admin:slack_integration.selecting_bot_types.slack_bot')}
          {/* TODO: add an appropriate link by GW-5614 */}
          <a className="ml-2 btn-link" href="#">
            {t('admin:slack_integration.selecting_bot_types.detailed_explanation')}
            <i className="fa fa-external-link ml-1" aria-hidden="true"></i>
          </a>
        </h2>

        {t('admin:slack_integration.selecting_bot_types.selecting_bot_type')}

        <div className="row my-5 flex-wrap-reverse justify-content-center">
          {botTypes.map((botType) => {
            return (
              <div key={botType} className="m-3">
                <BotTypeCard
                  botType={botType}
                  isActive={currentBotType === botType}
                  handleBotTypeSelect={handleBotTypeSelect}
                />
              </div>
            );
          })}
        </div>
      </div>

      {settingsComponent}
    </>
  );
};

const SlackIntegrationWrapper = withUnstatedContainers(SlackIntegration, [AppContainer]);

SlackIntegration.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default SlackIntegrationWrapper;
