import React from 'react';

import AccessTokenSettings from './AccessTokenSettings';
import OfficialBotSettings from './OfficialBotSettings';
import CustomBotNonProxySettings from './CustomBotNonProxySettings';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';
import ConfirmBotChangeModal from './ConfirmBotChangeModal';

const SlackIntegration = () => {
  const handleBotTypeSelect = (clickedBotType) => {
    console.log(clickedBotType);
    // showModal();
  };

  const currentBotType = 'custom-bot-with-proxy';
  let settingsComponent = null;

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

      <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#staticBackdrop">
        Launch static backdrop modal
      </button>

      <div className="modal fade" id="staticBackdrop" data-backdrop="static" data-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="false">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="staticBackdropLabel">Modal title</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              ...
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Understood</button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmBotChangeModal />

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
