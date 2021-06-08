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
import DeleteSlackBotSettingsModal from './DeleteSlackBotSettingsModal';

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
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);
  const [slackAppIntegrations, setSlackAppIntegrations] = useState();
  const [proxyServerUri, setProxyServerUri] = useState();
  const [connectionStatuses, setConnectionStatuses] = useState({});


  const fetchSlackIntegrationData = useCallback(async() => {
    try {
      const { data } = await appContainer.apiv3.get('/slack-integration-settings');
      const {
        slackSigningSecret, slackBotToken, slackSigningSecretEnvVars, slackBotTokenEnvVars, slackAppIntegrations, proxyServerUri,
      } = data.settings;

      setConnectionStatuses(data.connectionStatuses);
      setCurrentBotType(data.currentBotType);
      setSlackSigningSecret(slackSigningSecret);
      setSlackBotToken(slackBotToken);
      setSlackSigningSecretEnv(slackSigningSecretEnvVars);
      setSlackBotTokenEnv(slackBotTokenEnvVars);
      setSlackAppIntegrations(slackAppIntegrations);
      setProxyServerUri(proxyServerUri);
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer.apiv3]);

  const resetAllSettings = async() => {
    try {
      await appContainer.apiv3.delete('/slack-integration-settings/bot-type');
      fetchSlackIntegrationData();
      toastSuccess(t('admin:slack_integration.bot_all_reset_successful'));
    }
    catch (error) {
      toastError(error);
    }
  };

  const createSlackIntegrationData = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/slack-app-integrations');
      fetchSlackIntegrationData();
      toastSuccess(t('admin:slack_integration.adding_slack_ws_integration_settings_successful'));
    }
    catch (error) {
      toastError(error);
    }
  };

  const changeSecretAndToken = (secret, token) => {
    setSlackSigningSecret(secret);
    setSlackBotToken(token);
  };

  useEffect(() => {
    fetchSlackIntegrationData();
  }, [fetchSlackIntegrationData]);

  const changeCurrentBotSettings = async(botType) => {
    try {
      const res = await appContainer.apiv3.put('/slack-integration-settings/bot-type', {
        currentBotType: botType,
      });
      setCurrentBotType(res.data.slackBotTypeParam.slackBotType);
      setSelectedBotType(null);
      setIsRegisterSlackCredentials(false);
      setSlackSigningSecret(null);
      setSlackBotToken(null);
      setConnectionStatuses({});
    }
    catch (err) {
      toastError(err);
    }
  };

  const botTypeSelectHandler = async(botType) => {
    if (botType === currentBotType) {
      return;
    }
    if (currentBotType == null) {
      return changeCurrentBotSettings(botType);
    }
    setSelectedBotType(botType);
  };

  const changeCurrentBotSettingsHandler = async() => {
    changeCurrentBotSettings(selectedBotType);
    toastSuccess(t('admin:slack_integration.bot_reset_successful'));
  };

  const cancelBotChangeHandler = () => {
    setSelectedBotType(null);
  };

  let settingsComponent = null;

  switch (currentBotType) {
    case 'officialBot':
      settingsComponent = (
        <OfficialBotSettings
          slackAppIntegrations={slackAppIntegrations}
          proxyServerUri={proxyServerUri}
          onClickAddSlackWorkspaceBtn={createSlackIntegrationData}
          onClickDeleteSlackAppIntegrationBtn={fetchSlackIntegrationData}
          connectionStatuses={connectionStatuses}
        />
      );
      break;
    case 'customBotWithoutProxy':
      settingsComponent = (
        <CustomBotWithoutProxySettings
          isRegisterSlackCredentials={isRegisterSlackCredentials}
          slackBotTokenEnv={slackBotTokenEnv}
          slackBotToken={slackBotToken}
          slackSigningSecretEnv={slackSigningSecretEnv}
          slackSigningSecret={slackSigningSecret}
          onTestConnectionInvoked={fetchSlackIntegrationData}
          onUpdatedSecretToken={changeSecretAndToken}
          connectionStatuses={connectionStatuses}
        />
      );
      break;
    case 'customBotWithProxy':
      settingsComponent = (
        <CustomBotWithProxySettings
          slackAppIntegrations={slackAppIntegrations}
          proxyServerUri={proxyServerUri}
          onClickAddSlackWorkspaceBtn={createSlackIntegrationData}
          onClickDeleteSlackAppIntegrationBtn={fetchSlackIntegrationData}
          connectionStatuses={connectionStatuses}
        />
      );
      break;
  }

  return (
    <>
      <ConfirmBotChangeModal
        isOpen={selectedBotType != null}
        onConfirmClick={changeCurrentBotSettingsHandler}
        onCancelClick={cancelBotChangeHandler}
      />

      <DeleteSlackBotSettingsModal
        isResetAll
        isOpen={isDeleteConfirmModalShown}
        onClose={() => setIsDeleteConfirmModalShown(false)}
        onClickDeleteButton={resetAllSettings}
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

        <div className="d-flex justify-content-end">
          <button
            className="btn btn-outline-danger"
            type="button"
            onClick={() => setIsDeleteConfirmModalShown(true)}
          >{t('admin:slack_integration.reset_all_settings')}
          </button>
        </div>

        <div className="row my-5 flex-wrap-reverse justify-content-center">
          {botTypes.map((botType) => {
            return (
              <div key={botType} className="m-3">
                <BotTypeCard
                  botType={botType}
                  isActive={currentBotType === botType}
                  onBotTypeSelectHandler={botTypeSelectHandler}
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
