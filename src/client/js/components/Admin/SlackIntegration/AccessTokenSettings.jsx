import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

const AccessTokenSettings = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation('admin');

  const [accessToken, setAccessToken] = useState('asdfasdf');

  const generateTokenHandler = async() => {
    try {
      const accessToken = await appContainer.apiv3.put('slack-integration/access-token')
      console.log(accessToken)
    }
    catch (err) {
      toastError(err);
    }
  };

  const discardTokenHandler = async() => {
    // try {

    // }
    // catch (err) {
      
    // }
    console.log('discard');
  };

  return (
    <>
      <div className="form-group row my-5">
        <label className="text-left text-md-right col-md-3 col-form-label">Access Token</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            value={accessToken}
            readOnly
          />
        </div>
      </div>

      <div className="row">
        <div className="mx-auto">
          <button type="button" className="btn btn-outline-secondary text-nowrap mx-1" onClick={discardTokenHandler}>
            {t('slack_integration.access_token_settings.discard')}
          </button>
          <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={generateTokenHandler}>
            {t('slack_integration.access_token_settings.generate')}
          </button>
        </div>
      </div>
    </>
  );
};

const AccessTokenSettingsWrapper = withUnstatedContainers(AccessTokenSettings, [AppContainer]);

AccessTokenSettings.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default AccessTokenSettingsWrapper;
