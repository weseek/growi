import React from 'react';
import { useTranslation } from 'react-i18next';

import AccessTokenSettings from './AccessTokenSettings';
import OfficialBotSettings from './CustomBotNonProxySettings';
import CustomBotNonProxySettings from './CustomBotNonProxySettings';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';

const SlackIntegration = () => {


  const handleBotTypeSelect = (e) => {
    console.log(e.target.value);
  };

  // const selectedBotType = 'official-bot';
  const selectedBotType = 'custom-bot-non-proxy';
  // const selectedBotType = 'custom-bot-with-proxy';
  let settingsComponent = '';

  switch (selectedBotType) {
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
        <div className="mx-auto form-check" onChange={handleBotTypeSelect}>
          <div className="form-check-inline">
            <input className="form-check-input" type="radio" id="checkbox1" value="official-bot" />
            <label className="form-check-label" htmlFor="checkbox1">Official Bot</label>
          </div>
          <div className="form-check-inline">
            <input className="form-check-input" type="radio" id="checkbox2" value="custom-bot-non-proxy" />
            <label className="form-check-label" htmlFor="checkbox2">Custom Bot (Non Proxy)</label>
          </div>
          <div className="form-check-inline">
            <input className="form-check-input" type="radio" id="checkbox3" value="custom-bot-with-proxy" />
            <label className="form-check-label" htmlFor="checkbox3">Custom Bot (With Proxy)</label>
          </div>
        </div>
      </div>

      {settingsComponent}

    </>
  );
}

export default SlackIntegration;
