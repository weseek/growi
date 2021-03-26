/* eslint-disable no-console */
import React from 'react';
import { useTranslation } from 'react-i18next';

function AccessTokenSettings() {

  const { t } = useTranslation('admin');
  function discardHandler() {
    console.log('Discard button pressed');
  }

  function generateHandler() {
    console.log('Generate button pressed');
  }

  return (
    <>
      <div className="form-group row my-5">
        <label className="text-left text-md-right col-md-3 col-form-label">Access Token</label>
        <div className="col-md-6">
          <input className="form-control" type="text" placeholder="access-token" />
        </div>
      </div>

      <div className="row">
        <div className="mx-auto">
          <button type="button" className="btn btn-outline-secondary text-nowrap mx-1" onClick={discardHandler}>
            {t('slack_integration.access_token_settings.discard')}
          </button>
          <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={generateHandler}>
            {t('slack_integration.access_token_settings.generate')}
          </button>
        </div>
      </div>
    </>
  );
}

export default AccessTokenSettings;
