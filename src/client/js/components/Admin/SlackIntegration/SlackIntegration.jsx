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

  const botTypes = {
    officialBot: {
      name: t('admin:slack_integration.selecting_bot_types.official_bot'),
      level: t('admin:slack_integration.selecting_bot_types.for_beginners'),
      setUp: 'easy',
      multiWSIntegration: 'possible',
      securityControl: 'impossible',
    },
    customBotWithoutProxy: {
      name: t('admin:slack_integration.selecting_bot_types.custom_bot'),
      supplementaryBotName: t('admin:slack_integration.selecting_bot_types.without_proxy'),
      level: t('admin:slack_integration.selecting_bot_types.for_intermediate'),
      setUp: 'normal',
      multiWSIntegration: 'impossible',
      securityControl: 'possible',
    },
    customBotWithProxy: {
      name: t('admin:slack_integration.selecting_bot_types.custom_bot'),
      supplementaryBotName: t('admin:slack_integration.selecting_bot_types.with_proxy'),
      level: t('admin:slack_integration.selecting_bot_types.for_advanced'),
      setUp: 'hard',
      multiWSIntegration: 'possible',
      securityControl: 'impossible',
    },
  };

  const renderRecommendedBadge = () => {
    return (
      <span className="badge badge-info mr-2">
        {t('admin:slack_integration.selecting_bot_types.recommended')}
      </span>
    );
  };

  const renderBotTypeCards = () => {
    return (
      Object.entries(botTypes).map(([key, value]) => {
        return (
          <div
            className={`card admin-bot-card mx-3 rounded border-radius-sm shadow ${currentBotType === `${key}` ? 'border-primary' : ''}`}
            onClick={() => handleBotTypeSelect(`${key}`)}
            role="button"
            key={key}
          >
            <div>
              <h3 className={`card-header mb-0 py-3
              ${key === 'officialBot' ? 'd-flex align-items-center justify-content-center' : 'text-center'}
              ${currentBotType === `${key}` ? 'bg-primary text-light' : ''}`}
              >
                <span className="mr-2">
                  {value.name}

                </span>
                <span className="supplementary-bot-name mr-2">
                  {value.supplementaryBotName}
                </span>

                {key === 'officialBot' ? renderRecommendedBadge() : ''}

                {/* TODO: add an appropriate links by GW-5614 */}
                <i className={`fa fa-external-link btn-link ${currentBotType === `${key}` ? 'bg-primary text-light' : ''}`} aria-hidden="true"></i>
              </h3>
            </div>
            <div className="card-body p-4">
              <div className="card-text">
                <div className="text-center">
                  {value.level}
                </div>
                <div className="my-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>{t('admin:slack_integration.selecting_bot_types.set_up')}</span>
                    <span className={`bot-type-disc-${value.setUp}`}>{t(`admin:slack_integration.selecting_bot_types.${value.setUp}`)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>{t('admin:slack_integration.selecting_bot_types.multiple_workspaces_integration')}</span>
                    <span className={`bot-type-disc-${value.multiWSIntegration}`}>
                      {t(`admin:slack_integration.selecting_bot_types.${value.multiWSIntegration}`)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>{t('admin:slack_integration.selecting_bot_types.security_control')}</span>
                    <span className={`bot-type-disc-${value.securityControl}`}>
                      {t(`admin:slack_integration.selecting_bot_types.${value.securityControl}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })
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
            {renderBotTypeCards()}
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
