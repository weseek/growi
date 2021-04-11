import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AccessTokenSettings from './AccessTokenSettings';
import OfficialBotSettings from './OfficialBotSettings';
import CustomBotWithoutProxySettings from './CustomBotWithoutProxySettings';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';
import ConfirmBotChangeModal from './ConfirmBotChangeModal';


const SlackIntegration = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation();
  const [currentBotType, setCurrentBotType] = useState(null);
  const [selectedBotType, setSelectedBotType] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  const fetchData = useCallback(async() => {
    try {
      const response = await appContainer.apiv3.get('slack-integration/');
      const { currentBotType, accessToken } = response.data.slackBotSettingParams;
      setCurrentBotType(currentBotType);
      setAccessToken(accessToken);
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer.apiv3]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      const res = await appContainer.apiv3.put('slack-integration/custom-bot-without-proxy', {
        slackSigningSecret: '',
        slackBotToken: '',
        currentBotType: selectedBotType,
      });
      setCurrentBotType(res.data.customBotWithoutProxySettingParams.slackBotType);
      setSelectedBotType(null);
      toastSuccess(t('admin:slack_integration.bot_reset_successful'));
    }
    catch (err) {
      toastError(err);
    }
  };

  const generateTokenHandler = async() => {
    try {
      await appContainer.apiv3.put('slack-integration/access-token');
      fetchData();
    }
    catch (err) {
      toastError(err);
    }
  };

  const discardTokenHandler = async() => {
    try {
      await appContainer.apiv3.delete('slack-integration/access-token');
      fetchData();
      toastSuccess(t('admin:slack_integration.bot_reset_successful'));
    }
    catch (err) {
      toastError(err);
    }
  };

  let settingsComponent = null;

  switch (currentBotType) {
    case 'official-bot':
      settingsComponent = <OfficialBotSettings />;
      break;
    case 'custom-bot-without-proxy':
      settingsComponent = (
        <CustomBotWithoutProxySettings />
      );
      break;
    case 'custom-bot-with-proxy':
      settingsComponent = <CustomBotWithProxySettings />;
      break;
  }

  const showBotTypeLevel = (level) => {
    return <span>{t(`admin:slack_integration.selecting_bot_types.${level}`)}</span>;
  };
  const showBotTypeLabel = (label) => {
    return <span>{t(`admin:slack_integration.selecting_bot_types.${label}`)}</span>;
  };
  const showBotTypeDiscription = (desc) => {
    return <span className={`bot-type-disc-${desc}`}>{t(`admin:slack_integration.selecting_bot_types.${desc}`)}</span>;
  };

  const botTypeDescription = {
    officialBot: {
      level: t('admin:slack_integration.selecting_bot_types.for_beginners'),
      setUp: t('admin:slack_integration.selecting_bot_types.easy'),
      multiWSIntegration: t('admin:slack_integration.selecting_bot_types.possible'),
      securityControl: t('admin:slack_integration.selecting_bot_types.impossible'),
    },
    customBotWithProxy: {
      level: t('admin:slack_integration.selecting_bot_types.for_intermediate'),
      setUp: t('admin:slack_integration.selecting_bot_types.normal'),
      multiWSIntegration: t('admin:slack_integration.selecting_bot_types.impossible'),
      securityControl: t('admin:slack_integration.selecting_bot_types.possible'),
    },
    customBotWithoutProxy: {
      level: t('admin:slack_integration.selecting_bot_types.for_advanced'),
      setUp: t('admin:slack_integration.selecting_bot_types.hard'),
      multiWSIntegration: t('admin:slack_integration.selecting_bot_types.possible'),
      securityControl: t('admin:slack_integration.selecting_bot_types.impossible'),
    },
  };


  const renderCaedBody = (setUpDesc, multiWSIntegrationDesc, securityControlDesc) => {
    return (
      <div className="card-body p-4">
        <p className="card-text">
          <div className="text-center">
            {showBotTypeLevel('for_beginners')}
          </div>
          <div className="my-4">
            <div className="d-flex justify-content-between mb-2">
              {showBotTypeLabel('set_up')}
              {showBotTypeDiscription('easy')}
            </div>
            <div className="d-flex justify-content-between mb-2">
              {showBotTypeLabel('multiple_workspaces_integration')}
              {showBotTypeDiscription('possible')}
            </div>
            <div className="d-flex justify-content-between">
              {showBotTypeLabel('security_control')}
              {showBotTypeDiscription('impossible')}
            </div>
          </div>
        </p>
      </div>
    );
  };

  const renderBotTypeCard = (botType) => {
    return (
      <div
        className={`card admin-bot-card mx-3 rounded border-radius-sm shadow ${currentBotType === `${botType}` ? 'border-primary' : ''}`}
        onClick={() => handleBotTypeSelect(`${botType}`)}
        role="button"
      >
        <div>
          <h3 className={`card-header mb-0 py-3 text-center ${currentBotType === `${botType}` ? 'bg-primary text-light' : ''}`}>
            <span className="mr-2">
              {t('admin:slack_integration.selecting_bot_types.official_bot')}
            </span>
            <span className="badge badge-info mr-2">
              {t('admin:slack_integration.selecting_bot_types.recommended')}
            </span>
            {/* TODO: add an appropriate link by GW-5614 */}
            <i className={`fa fa-external-link btn-link ${currentBotType === `${botType}` ? 'bg-primary text-light' : ''}`} aria-hidden="true"></i>
          </h3>
        </div>

        {/* <div className="card-body p-4">
          <p className="card-text">
            <div className="text-center">
              {showBotTypeLevel('for_beginners')}
            </div>
            <div className="my-4">
              <div className="d-flex justify-content-between mb-2">
                {showBotTypeLabel('set_up')}
                {showBotTypeDiscription('easy')}
              </div>
              <div className="d-flex justify-content-between mb-2">
                {showBotTypeLabel('multiple_workspaces_integration')}
                {showBotTypeDiscription('possible')}
              </div>
              <div className="d-flex justify-content-between">
                {showBotTypeLabel('security_control')}
                {showBotTypeDiscription('impossible')}
              </div>
            </div>
          </p>
        </div> */}
        {Object.entries(botTypeDescription).map(([key, value]) => {
          return (
            <div className="card-body p-4">
              <p className="card-text">
                <div className="text-center">
                  {value.level}
                </div>
                <div className="my-4">
                  <div className="d-flex justify-content-between mb-2">
                    {showBotTypeLabel('set_up')}
                    <span>{value.setUp}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    {showBotTypeLabel('multiple_workspaces_integration')}
                    <span>{value.multiWSIntegration}</span>

                  </div>
                  <div className="d-flex justify-content-between">
                    {showBotTypeLabel('security_control')}
                    <span>{value.securityControl}</span>
                  </div>
                </div>
              </p>
            </div>
            );
          })}
      </div>
    );
  };

  return (
    <>
      <ConfirmBotChangeModal
        isOpen={selectedBotType != null}
        onConfirmClick={changeCurrentBotSettingsHandler}
        onCancelClick={cancelBotChangeHandler}
      />

      <AccessTokenSettings
        accessToken={accessToken}
        onClickDiscardButton={discardTokenHandler}
        onClickGenerateToken={generateTokenHandler}
      />

      <div className="selecting-bot-type my-5">
        <h2 className="admin-setting-header mb-4">
          {t('admin:slack_integration.selecting_bot_types.slack_bot')}
          <span className="ml-2 btn-link">
            <span className="mr-1">{t('admin:slack_integration.selecting_bot_types.detailed_explanation')}</span>
            {/* TODO: add an appropriate link by GW-5614 */}
            <i className="fa fa-external-link" aria-hidden="true"></i>
          </span>

        </h2>

        {t('admin:slack_integration.selecting_bot_types.selecting_bot_type')}

        <div className="row my-4">
          <div className="card-deck mx-auto">
            {renderBotTypeCard('official-bot')}

            {/* <div
              className={`card admin-bot-card mx-3 rounded border-radius-sm shadow ${currentBotType === 'official-bot' ? 'border-primary' : ''}`}
              onClick={() => handleBotTypeSelect('official-bot')}
              role="button"
            >
              <div>
                <h3 className={`card-header mb-0 py-3 text-center ${currentBotType === 'official-bot' ? 'bg-primary text-light' : ''}`}>
                  <span className="mr-2">
                    {t('admin:slack_integration.selecting_bot_types.official_bot')}
                  </span>
                  <span className="badge badge-info mr-2">
                    {t('admin:slack_integration.selecting_bot_types.recommended')}
                  </span> */}
            {/* TODO: add an appropriate link by GW-5614 */}
            {/* <i className={`fa fa-external-link btn-link ${currentBotType === 'official-bot' ? 'bg-primary text-light' : ''}`} aria-hidden="true"></i>
                </h3>
              </div>
              <div className="card-body p-4">
                <p className="card-text">
                  <div className="text-center">
                    {showBotTypeLevel('for_beginners')}
                  </div>
                  <div className="my-4">
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('set_up')}
                      {showBotTypeDiscription('easy')}
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('multiple_workspaces_integration')}
                      {showBotTypeDiscription('possible')}
                    </div>
                    <div className="d-flex justify-content-between">
                      {showBotTypeLabel('security_control')}
                      {showBotTypeDiscription('impossible')}
                    </div>
                  </div>
                </p>
              </div>
            </div> */}

            <div
              className={`card admin-bot-card mx-3 rounded shadow ${currentBotType === 'custom-bot-without-proxy' ? 'border-primary' : ''}`}
              onClick={() => handleBotTypeSelect('custom-bot-without-proxy')}
              role="button"
            >
              <h3 className={`card-header mb-0 py-3 text-center text-nowrap  ${currentBotType === 'custom-bot-without-proxy' ? 'bg-primary text-light' : ''}`}>
                <span className="mr-2">
                  {t('admin:slack_integration.selecting_bot_types.custom_bot')}
                </span>
                <span className="supplementary-desc mr-2">
                  {t('admin:slack_integration.selecting_bot_types.without_proxy')}
                </span>
                {/* TODO: add an appropriate link by GW-5614 */}
                <i
                  className={`fa fa-external-link btn-link ${currentBotType === 'custom-bot-without-proxy' ? 'bg-primary text-light' : ''}`}
                  aria-hidden="true"
                >
                </i>
              </h3>
              <div className="card-body p-4">
                <p className="card-text">
                  <div className="text-center">
                    {showBotTypeLevel('for_intermediate')}
                  </div>
                  <div className="my-4">
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('set_up')}
                      {showBotTypeDiscription('normal')}
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('multiple_workspaces_integration')}
                      {showBotTypeDiscription('impossible')}
                    </div>
                    <div className="d-flex justify-content-between">
                      {showBotTypeLabel('security_control')}
                      {showBotTypeDiscription('possible')}
                    </div>
                  </div>
                </p>
              </div>
            </div>

            <div
              className={`card admin-bot-card mx-3 rounded shadow ${currentBotType === 'custom-bot-with-proxy' ? 'border-primary' : ''}`}
              onClick={() => handleBotTypeSelect('custom-bot-with-proxy')}
              role="button"
            >
              <h3 className={`card-header mb-0 py-3 text-center text-nowrap ${currentBotType === 'custom-bot-with-proxy' ? 'bg-primary text-light' : ''}`}>
                <span className="mr-2">
                  {t('admin:slack_integration.selecting_bot_types.custom_bot')}
                </span>
                <span className="supplementary-desc mr-2">
                  {t('admin:slack_integration.selecting_bot_types.with_proxy')}
                </span>
                {/* TODO: add an appropriate link by GW-5614 */}
                <i
                  className={`fa fa-external-link btn-link ${currentBotType === 'custom-bot-with-proxy' ? 'bg-primary text-light' : ''}`}
                  aria-hidden="true"
                >
                </i>
              </h3>
              <div className="card-body p-4">
                <p className="card-text">
                  <div className="text-center">
                    {showBotTypeLevel('for_advanced')}
                  </div>
                  <div className="my-4">
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('set_up')}
                      {showBotTypeDiscription('hard')}
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('multiple_workspaces_integration')}
                      {showBotTypeDiscription('possible')}
                    </div>
                    <div className="d-flex justify-content-between">
                      {showBotTypeLabel('security_control')}
                      {showBotTypeDiscription('impossible')}
                    </div>
                  </div>
                </p>
              </div>
            </div>

          </div>
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
