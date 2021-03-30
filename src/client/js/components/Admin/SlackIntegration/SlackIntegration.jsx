import React from 'react';

import AccessTokenSettings from './AccessTokenSettings';
import OfficialBotSettings from './OfficialBotSettings';
import CustomBotNonProxySettings from './CustomBotNonProxySettings';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';

const SlackIntegration = () => {
  const handleBotTypeSelect = e => {
    console.log(e.target.value);
  };

  let currentBotType = null;
  let settingsComponent = null;

  switch (currentBotType) {
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
      <div className="row">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">Access Token</h2>
          <AccessTokenSettings />
        </div>
      </div>

      <div className="row my-5">
        <div className="card-group mx-auto">

          <div className="card mx-3 py-5">
            <div className="card-body">
              <h5 className="card-title">Official Bot</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
              <a href="#" className="stretched-link" onClick={handleBotTypeSelect} />
            </div>
          </div>

          <div className="card mx-3 py-5">
            <div className="card-body">
              <h5 className="card-title">Custom Bot (Non Proxy)</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
              <a href="#" className="stretched-link" onClick={handleBotTypeSelect} />
            </div>
          </div>

          <div className="card mx-3 py-5">
            <div className="card-body">
              <h5 className="card-title">Custom Bot (With Proxy)</h5>
              <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
              <a href="#" className="stretched-link" onClick={handleBotTypeSelect} />
            </div>
          </div>

        </div>
      </div>

      {settingsComponent}
    </>
  );
};

export default SlackIntegration;
