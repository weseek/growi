import React, { useState, useEffect, useCallback } from 'react';

import { SlackbotType } from '@growi/slack';
import { useTranslation } from 'next-i18next';


import {
  apiv3Delete, apiv3Get, apiv3Post, apiv3Put,
} from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';

import BotTypeCard from './BotTypeCard';
import ConfirmBotChangeModal from './ConfirmBotChangeModal';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';
import CustomBotWithoutProxySettings from './CustomBotWithoutProxySettings';
import DeleteSlackBotSettingsModal from './DeleteSlackBotSettingsModal';
import OfficialBotSettings from './OfficialBotSettings';


const botTypes = Object.values(SlackbotType);

const SlackIntegration = () => {

  const { t } = useTranslation();
  const [currentBotType, setCurrentBotType] = useState(null);
  const [selectedBotType, setSelectedBotType] = useState(null);
  const [slackSigningSecret, setSlackSigningSecret] = useState(null);
  const [slackBotToken, setSlackBotToken] = useState(null);
  const [slackSigningSecretEnv, setSlackSigningSecretEnv] = useState('');
  const [slackBotTokenEnv, setSlackBotTokenEnv] = useState('');
  const [commandPermission, setCommandPermission] = useState(null);
  const [eventActionsPermission, setEventActionsPermission] = useState(null);
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);
  const [slackAppIntegrations, setSlackAppIntegrations] = useState();
  const [proxyServerUri, setProxyServerUri] = useState();
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const fetchSlackIntegrationData = useCallback(async() => {
    try {
      const { data } = await apiv3Get('/slack-integration-settings');
      const {
        slackSigningSecret,
        slackBotToken,
        slackSigningSecretEnvVars,
        slackBotTokenEnvVars,
        slackAppIntegrations,
        proxyServerUri,
        commandPermission,
        eventActionsPermission,
      } = data.settings;

      setErrorMsg(data.errorMsg);
      setErrorCode(data.errorCode);
      setConnectionStatuses(data.connectionStatuses);
      setCurrentBotType(data.currentBotType);
      setSlackSigningSecret(slackSigningSecret);
      setSlackBotToken(slackBotToken);
      setSlackSigningSecretEnv(slackSigningSecretEnvVars);
      setSlackBotTokenEnv(slackBotTokenEnvVars);
      setSlackAppIntegrations(slackAppIntegrations);
      setProxyServerUri(proxyServerUri);
      setCommandPermission(commandPermission);
      setEventActionsPermission(eventActionsPermission);
    }
    catch (err) {
      toastError(err);
    }
    finally {
      setIsLoading(false);
    }
  }, []);

  const resetAllSettings = async() => {
    try {
      await apiv3Delete('/slack-integration-settings/bot-type');
      fetchSlackIntegrationData();
      toastSuccess(t('admin:slack_integration.bot_all_reset_successful'));
    }
    catch (error) {
      toastError(error);
    }
  };

  const createSlackIntegrationData = async() => {
    try {
      await apiv3Post('/slack-integration-settings/slack-app-integrations');
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
      await apiv3Put('/slack-integration-settings/bot-type', {
        currentBotType: botType,
      });
      setSelectedBotType(null);
      fetchSlackIntegrationData();
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
    case SlackbotType.OFFICIAL:
      settingsComponent = (
        <OfficialBotSettings
          slackAppIntegrations={slackAppIntegrations}
          onClickAddSlackWorkspaceBtn={createSlackIntegrationData}
          onPrimaryUpdated={fetchSlackIntegrationData}
          onDeleteSlackAppIntegration={fetchSlackIntegrationData}
          connectionStatuses={connectionStatuses}
          onUpdateTokens={fetchSlackIntegrationData}
          onSubmitForm={fetchSlackIntegrationData}
        />
      );
      break;
    case SlackbotType.CUSTOM_WITHOUT_PROXY:
      settingsComponent = (
        <CustomBotWithoutProxySettings
          slackBotTokenEnv={slackBotTokenEnv}
          slackBotToken={slackBotToken}
          slackSigningSecretEnv={slackSigningSecretEnv}
          slackSigningSecret={slackSigningSecret}
          onTestConnectionInvoked={fetchSlackIntegrationData}
          onUpdatedSecretToken={changeSecretAndToken}
          connectionStatuses={connectionStatuses}
          commandPermission={commandPermission}
          eventActionsPermission={eventActionsPermission}
        />
      );
      break;
    case SlackbotType.CUSTOM_WITH_PROXY:
      settingsComponent = (
        <CustomBotWithProxySettings
          slackAppIntegrations={slackAppIntegrations}
          proxyServerUri={proxyServerUri}
          onClickAddSlackWorkspaceBtn={createSlackIntegrationData}
          onPrimaryUpdated={fetchSlackIntegrationData}
          onDeleteSlackAppIntegration={fetchSlackIntegrationData}
          connectionStatuses={connectionStatuses}
          onUpdateTokens={fetchSlackIntegrationData}
          onSubmitForm={fetchSlackIntegrationData}
        />
      );
      break;
  }

  if (isLoading) {
    return (
      <div className="text-muted text-center">
        <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
      </div>
    );
  }

  return (
    <div data-testid="admin-slack-integration">
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
          <a className="ms-2 btn-link small" href={t('admin:slack_integration.docs_url.slack_integration')} target="_blank" rel="noopener noreferrer">
            <i className="icon icon-question ms-1" aria-hidden="true"></i>
          </a>
        </h2>

        { errorCode && (
          <div className="alert alert-warning">
            <strong>ERROR: </strong>{errorMsg} ({errorCode})
          </div>
        ) }

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
    </div>
  );
};

export default SlackIntegration;
