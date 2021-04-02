import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';
import AccessTokenSettings from './AccessTokenSettings';
import OfficialBotSettings from './OfficialBotSettings';
import CustomBotWithoutProxySettings from './CustomBotWithoutProxySettings';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';
import ConfirmBotChangeModal from './ConfirmBotChangeModal';

const SlackIntegration = (props) => {
  const { appContainer } = props;

  const [currentBotType, setCurrentBotType] = useState(null);
  const [selectedBotType, setSelectedBotType] = useState(null);

  const resetBotType = async() => {
    try {
      await appContainer.apiv3.put('slack-integration/custom-bot-without-proxy', {
        slackSigningSecret: '',
        slackBotToken: '',
        botType: '',
      });
    }
    catch (err) {
      toastError(err);
    }
  };

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

  const changeCurrentBotSettings = () => {
    resetBotType();
    setCurrentBotType(selectedBotType);
    setSelectedBotType(null);
  };

  let settingsComponent = null;

  switch (currentBotType) {
    case 'official-bot':
      settingsComponent = <OfficialBotSettings />;
      break;
    case 'custom-bot-without-proxy':
      settingsComponent = <CustomBotWithoutProxySettings />;
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
          onConfirmClick={changeCurrentBotSettings}
          onCancelClick={handleCancelBotChange}
        />
      </div>

      <AccessTokenSettings />

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

const SlackIntegrationWrapper = withUnstatedContainers(SlackIntegration, [AppContainer]);

SlackIntegration.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default SlackIntegrationWrapper;
