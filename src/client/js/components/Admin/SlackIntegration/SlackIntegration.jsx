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
  const [isSendTestMessage, setIsSendTestMessage] = useState(false);
  const [slackWSNameInWithoutProxy, setSlackWSNameInWithoutProxy] = useState(null);
  const [isDeleteConfirmModalShown, setIsDeleteConfirmModalShown] = useState(false);

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

      setCurrentBotType(data.currentBotType);
      setSlackSigningSecret(slackSigningSecret);
      setSlackBotToken(slackBotToken);
      setSlackSigningSecretEnv(slackSigningSecretEnvVars);
      setSlackBotTokenEnv(slackBotTokenEnvVars);
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer.apiv3]);

  const resetWithOutSettings = async() => {
    try {
      await appContainer.apiv3.put('/slack-integration-settings/bot-type', { currentBotType: 'customBotWithoutProxy' });
      fetchSlackIntegrationData();
      toastSuccess(t('admin:slack_integration.bot_reset_successful'));
    }
    catch (error) {
      toastError(error);
    }
  };

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
      const res = await appContainer.apiv3.put('/slack-integration-settings/bot-type', {
        currentBotType: selectedBotType,
      });
      setCurrentBotType(res.data.slackBotTypeParam.slackBotType);
      setSelectedBotType(null);
      setIsRegisterSlackCredentials(false);
      setSlackSigningSecret(null);
      setSlackBotToken(null);
      setIsSendTestMessage(false);
      setSlackWSNameInWithoutProxy(null);
      toastSuccess(t('admin:slack_integration.bot_reset_successful'));
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
          onResetSettings={resetWithOutSettings}
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

      {/* TODO add onClickDeleteButton */}
      <DeleteSlackBotSettingsModal
        isResetAll
        isOpen={isDeleteConfirmModalShown}
        onClose={() => setIsDeleteConfirmModalShown(false)}
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

        <div className="d-flex justify-content">
          <div className="mr-auto">
            {t('admin:slack_integration.selecting_bot_types.selecting_bot_type')}
          </div>

          {(currentBotType === 'officialBot' || currentBotType === 'customBotWithProxy') && (
            <button
              className="mx-3 btn btn-outline-danger flex-end"
              type="button"
              onClick={() => setIsDeleteConfirmModalShown(true)}
            >{t('admin:slack_integration.reset_all_settings')}
            </button>
          )}
        </div>

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
