import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';

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
  // const [slackWSNameInWithoutProxy, setSlackWSNameInWithoutProxy] = useState(null);

  // const getSlackWSInWithoutProxy = useCallback(async() => {
  //   try {
  //     const res = await appContainer.apiv3.get('/slack-integration/custom-bot-without-proxy-slack-workspace');
  //     setSlackWSNameInWithoutProxy(res.data.slackWorkSpaceName);
  //   }
  //   catch (err) {
  //     toastError(err);
  //   }
  // }, [appContainer]);

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

  const handleCancelBotChange = () => {
    setSelectedBotType(null);
  };

  const handleChangeCurrentBotSettings = async() => {
    try {
      const res = await appContainer.apiv3.put('slack-integration/custom-bot-without-proxy', {
        slackSigningSecret: '',
        slackBotToken: '',
        botType: selectedBotType,
      });
      setCurrentBotType(res.data.customBotWithoutProxySettingParams.slackBotType);
      setSelectedBotType(null);
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

  return (
    <>
      <div className="container">
        <ConfirmBotChangeModal
          isOpen={selectedBotType != null}
          onConfirmClick={handleChangeCurrentBotSettings}
          onCancelClick={handleCancelBotChange}
        />
      </div>

      <div className="row">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">Access Token</h2>
          <AccessTokenSettings />
        </div>
      </div>

      <div className="row my-5">
        <div className="card-deck mx-auto">

          <div
            className={`card admin-bot-card mx-3 py-5 rounded ${currentBotType === 'official-bot' ? 'border-info' : ''}`}
            onClick={() => handleBotTypeSelect('official-bot')}
          >
            <div className="card-body">
              <h5 className="card-title">Official Bot</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content.</p>
            </div>
          </div>

          <div
            className={`card admin-bot-card mx-3 py-5 rounded ${currentBotType === 'custom-bot-without-proxy' ? 'border-info' : ''}`}
            onClick={() => handleBotTypeSelect('custom-bot-without-proxy')}
          >
            <div className="card-body">
              <h5 className="card-title">Custom Bot (Without Proxy)</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. </p>
            </div>
          </div>

          <div
            className={`card admin-bot-card mx-3 py-5 rounded ${currentBotType === 'custom-bot-with-proxy' ? 'border-info' : ''}`}
            onClick={() => handleBotTypeSelect('custom-bot-with-proxy')}
          >
            <div className="card-body">
              <h5 className="card-title">Custom Bot (With Proxy)</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content.</p>
            </div>
          </div>

        </div>
      </div>

      {settingsComponent}
    </>
  );
};

const SlackIntegrationWrapper = withUnstatedContainers(SlackIntegration, [AppContainer, AdminAppContainer]);

SlackIntegration.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default SlackIntegrationWrapper;
