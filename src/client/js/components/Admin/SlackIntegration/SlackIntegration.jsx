import React, { useState } from 'react';

import AccessTokenSettings from './AccessTokenSettings';
import OfficialBotSettings from './OfficialBotSettings';
import CustomBotNonProxySettings from './CustomBotNonProxySettings';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';
import ConfirmBotChangeModal from './ConfirmBotChangeModal';

const SlackIntegration = () => {

  const [modalVisibility, setmodalVisibility] = useState(false);
  const [currentBotType, setcurrentBotType] = useState('custom-bot-non-proxy');
  let settingsComponent = null;

  const changeBotSettings = (botType) => {
    console.log(botType);
  }

  const handleBotTypeSelect = (clickedBotType) => {
    console.log(clickedBotType);
    setmodalVisibility(true);
  };

  switch (currentBotType) {
    case 'official-bot':
      settingsComponent = <OfficialBotSettings />;
      break;
    case 'custom-bot-non-proxy':
      settingsComponent = <CustomBotNonProxySettings />;
      break;
    case 'custom-bot-with-proxy':
      settingsComponent = <CustomBotWithProxySettings />;
      break;
    default:
      settingsComponent = <OfficialBotSettings />;
      break;
  }

  return (
    <>
      <div className="container">
        <ConfirmBotChangeModal
          show={modalVisibility}
          onButtonClick={(button) => {
            if (button === 'close') setmodalVisibility(false);
            if (button === 'change') changeBotSettings();
          }}
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

          <div className={`card mx-3 py-5 rounded ${currentBotType === 'official-bot' ? 'border-info' : ''}`}>
            <div className="card-body">
              <h5 className="card-title">Official Bot</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
              <a href="#" className="stretched-link" onClick={() => handleBotTypeSelect('official-bot')} />
            </div>
          </div>

          <div className={`card mx-3 py-5 rounded ${currentBotType === 'custom-bot-non-proxy' ? 'border-info' : ''}`}>
            <div className="card-body">
              <h5 className="card-title">Custom Bot (Non Proxy)</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. </p>
              <a href="#" className="stretched-link" onClick={() => handleBotTypeSelect('custom-bot-non-proxy')} />
            </div>
          </div>

          <div className={`card mx-3 py-5 rounded ${currentBotType === 'custom-bot-with-proxy' ? 'border-info' : ''}`}>
            <div className="card-body">
              <h5 className="card-title">Custom Bot (With Proxy)</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longerThis is a wider card with supporting text below as a natural lead-This is a wider card with supporting text below as a natural lead-This is a wider card with supporting text below as a natural lead-This is a wider card with supporting text below as a natural lead-</p>
              <a href="#" className="stretched-link" onClick={() => handleBotTypeSelect('custom-bot-with-proxy')} />
            </div>
          </div>

        </div>
      </div>

      {settingsComponent}
    </>
  );
};

export default SlackIntegration;
