import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toastSuccess, toastError } from '../../../util/apiNotification';
import { apiv3Delete, apiv3Put } from '~/utils/apiv3-client';
import { useSlackIntegrationSWR } from '~/stores/slack-integration';

// TODO: Fix Can't resolve '../../../services/AppContainer'
// import OfficialBotSettings from './OfficialBotSettings';
// import CustomBotWithoutProxySettings from './CustomBotWithoutProxySettings';
// import CustomBotWithProxySettings from './CustomBotWithProxySettings';
import ConfirmBotChangeModal from './ConfirmBotChangeModal';
import BotTypeCard from './BotTypeCard';
import DeleteSlackBotSettingsModal from './DeleteSlackBotSettingsModal';

const botTypes = ['officialBot', 'customBotWithoutProxy', 'customBotWithProxy'];

const SlackIntegration = () => {

  const { t } = useTranslation();

  const { data, mutate: mutateSlackIntegrationData, error, isValidating } = useSlackIntegrationSWR();
  const {
    slackSigningSecret, slackBotToken, slackSigningSecretEnvVars, slackBotTokenEnvVars, slackAppIntegrations, proxyServerUri,
  } = data?.settings || {};

  const { currentBotType, connectionStatuses } = data || {};

  if (error != null) {
    toastError(error)
  }

  const [selectedBotType, setSelectedBotType] = useState(null);
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);

  const resetAllSettings = async () => {
    try {
      await apiv3Delete('/slack-integration-settings/bot-type');
      mutateSlackIntegrationData();
      toastSuccess(t('admin:slack_integration.bot_all_reset_successful'));
    }
    catch (error) {
      toastError(error);
    }
  };

  const createSlackIntegrationData = async () => {
    try {
      await apiv3Put('/slack-integration-settings/slack-app-integrations');
      mutateSlackIntegrationData();
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
    console.log(data)
  }, [data]);

  const changeCurrentBotSettings = async (botType) => {
    try {
      await apiv3Put('/slack-integration-settings/bot-type', {
        currentBotType: botType,
      });
      setSelectedBotType(null);
      mutateSlackIntegrationData();
    }
    catch (err) {
      toastError(err);
    }
  };

  const botTypeSelectHandler = async (botType) => {
    if (botType === currentBotType) {
      return;
    }
    if (currentBotType == null) {
      return changeCurrentBotSettings(botType);
    }
    setSelectedBotType(botType);
  };

  const changeCurrentBotSettingsHandler = async () => {
    changeCurrentBotSettings(selectedBotType);
    toastSuccess(t('admin:slack_integration.bot_reset_successful'));
  };

  const cancelBotChangeHandler = () => {
    setSelectedBotType(null);
  };

  let settingsComponent = null;

  switch (currentBotType) {
    // case 'officialBot':
    //   settingsComponent = (
    //     <OfficialBotSettings
    //       slackAppIntegrations={slackAppIntegrations}
    //       onClickAddSlackWorkspaceBtn={createSlackIntegrationData}
    //       onDeleteSlackAppIntegration={mutateSlackIntegrationData}
    //       connectionStatuses={connectionStatuses}
    //       onUpdateTokens={mutateSlackIntegrationData}
    //       onSubmitForm={mutateSlackIntegrationData}
    //     />
    //   );
    //   break;
    // case 'customBotWithoutProxy':
    //   settingsComponent = (
    //     <CustomBotWithoutProxySettings
    //       slackBotTokenEnv={slackBotTokenEnv}
    //       slackBotToken={slackBotToken}
    //       slackSigningSecretEnv={slackSigningSecretEnv}
    //       slackSigningSecret={slackSigningSecret}
    //       onTestConnectionInvoked={mutateSlackIntegrationData}
    //       onUpdatedSecretToken={changeSecretAndToken}
    //       connectionStatuses={connectionStatuses}
    //     />
    //   );
    //   break;
    // case 'customBotWithProxy':
    //   settingsComponent = (
    //     <CustomBotWithProxySettings
    //       slackAppIntegrations={slackAppIntegrations}
    //       proxyServerUri={proxyServerUri}
    //       onClickAddSlackWorkspaceBtn={createSlackIntegrationData}
    //       onDeleteSlackAppIntegration={mutateSlackIntegrationData}
    //       connectionStatuses={connectionStatuses}
    //       onUpdateTokens={mutateSlackIntegrationData}
    //       onSubmitForm={mutateSlackIntegrationData}
    //     />
    //   );
    //   break;
  }

  if (isValidating) {
    return (
      <div className="text-muted text-center">
        <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
      </div>
    );
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
          {/* TODO: If Bot-manual section of docs is merged into master, show links and add an appropriate links by GW-5614. */}
          {/* <a className="ml-2 btn-link" href="#">
            {t('admin:slack_integration.selecting_bot_types.detailed_explanation')}
            <i className="fa fa-external-link ml-1" aria-hidden="true"></i>
          </a> */}
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

      {data && settingsComponent}
    </>
  );
};


export default SlackIntegration;
