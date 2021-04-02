import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { toastSuccess } from '../../../util/apiNotification';

const AccessTokenSettings = (props) => {
  const { t } = useTranslation('admin');

  const discardTokenHandler = () => {
    if (props.discardTokenHandler) {
      props.discardTokenHandler();
    }
  };

  const generateTokenHandler = () => {
    if (props.generateTokenHandler) {
      props.generateTokenHandler();
    }
  };

  const textboxClickHandler = (e) => {
    e.target.select();
    if (props.accessToken) {
      navigator.clipboard.writeText(props.accessToken)
        .then(() => { toastSuccess('slack_integration.copied_to_clipboard') });
    }
  };

  return (
    <div className="row">
      <div className="col-lg-12">

        <h2 className="admin-setting-header">Access Token</h2>

        <div className="form-group row my-5">
          <label className="text-left text-md-right col-md-3 col-form-label">Access Token</label>
          <div className="col-md-6">
            <input className="form-control" type="text" value={props.accessToken} onClick={e => textboxClickHandler(e)} readOnly />
          </div>
        </div>

        <div className="row">
          <div className="mx-auto">
            <button type="button" className="btn btn-outline-secondary text-nowrap mx-1" onClick={discardTokenHandler} disabled={!props.accessToken}>
              {t('slack_integration.access_token_settings.discard')}
            </button>
            <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={generateTokenHandler}>
              {t('slack_integration.access_token_settings.generate')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

AccessTokenSettings.propTypes = {
  accessToken: PropTypes.string,
  discardTokenHandler: PropTypes.func,
  generateTokenHandler: PropTypes.func,
};

export default AccessTokenSettings;
