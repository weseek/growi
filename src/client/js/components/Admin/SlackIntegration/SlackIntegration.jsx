import React, { useState } from 'react';

import AccessTokenSettings from './AccessTokenSettings';
import OfficialBotSettings from './OfficialBotSettings';
import CustomBotWithoutProxySettings from './CustomBotWithoutProxySettings';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';
import ConfirmBotChangeModal from './ConfirmBotChangeModal';

const SlackIntegration = () => {
  const [currentBotType, setcurrentBotType] = useState(null);
  const [selectedBotType, setSelectedBotType] = useState(null);
  const [modalVisibility, setmodalVisibility] = useState(false);

  const handleBotTypeSelect = (clickedBotType) => {
    if (clickedBotType === currentBotType) {
      return;
    }
    if (currentBotType === null) {
      setcurrentBotType(clickedBotType);
      return;
    }
    setSelectedBotType(clickedBotType);
    setmodalVisibility(true);
  };

  const handleBotChangeCancel = () => {
    setSelectedBotType(null);
    setmodalVisibility(false);
  };

  const changeCurrentBotSettings = () => {
    setcurrentBotType(selectedBotType);
    setSelectedBotType(null);
    setmodalVisibility(false);
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
          show={modalVisibility}
          onConfirmClick={changeCurrentBotSettings}
          onCancelClick={handleBotChangeCancel}
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
            className={`card mx-3 py-5 rounded ${currentBotType === 'official-bot' ? 'border-info' : ''}`}
            onClick={) => handleBotTypeSelect('official-bot')}
            style={{cursor: pointer}}
          >
            <div className="card-body">
              <h5 className="card-title">Official Bot</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content.</p>
            </div>
          </div>

          <div
            className={`card mx-3 py-5 rounded ${currentBotType === 'custom-bot-without-proxy' ? 'border-info' : ''}`}
            onClick={() => handleBotTypeSelect('custom-bot-without-proxy')}
            style={{cursor: pointer}}
          >
            <div className="card-body">
              <h5 className="card-title">Custom Bot (Without Proxy)</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. </p>
            </div>
          </div>

          <div
            className={`card mx-3 py-5 rounded ${currentBotType === 'custom-bot-with-proxy' ? 'border-info' : ''}`}
            onClick={() => handleBotTypeSelect('custom-bot-with-proxy')}
            style={{cursor: pointer}}
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

export default SlackIntegration;
