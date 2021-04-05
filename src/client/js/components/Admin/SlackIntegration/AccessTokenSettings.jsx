import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toastSuccess } from '../../../util/apiNotification';

const AccessTokenSettings = (props) => {
  const { t } = useTranslation('admin');

  const onClickDiscardButton = () => {
    if (props.onClickDiscardButton) {
      props.onClickDiscardButton();
    }
  };

  const onClickGenerateToken = () => {
    if (props.onClickGenerateToken) {
      props.onClickGenerateToken();
    }
  };

  const showCopiedToaster = () => {
    toastSuccess(t('slack_integration.copied_to_clipboard'));
  };

  const accessToken = props.accessToken ? props.accessToken : '';

  return (
    <div className="row">
      <div className="col-lg-12">

        <h2 className="admin-setting-header">Access Token</h2>

        <div className="form-group row my-5">
          <label className="text-left text-md-right col-md-3 col-form-label">Access Token</label>
          <div className="col-md-6">
            {props.accessToken == null ? (
              <input className="form-control" type="text" value={accessToken} readOnly />
            ) : (
              <CopyToClipboard text={accessToken} onCopy={showCopiedToaster}>
                <input className="form-control" type="text" value={accessToken} readOnly />
              </CopyToClipboard>
            )}
          </div>
        </div>

        <div className="row">
          <div className="mx-auto">
            <button type="button" className="btn btn-outline-secondary text-nowrap mx-1" onClick={onClickDiscardButton} disabled={!props.accessToken}>
              {t('slack_integration.access_token_settings.discard')}
            </button>
            <button type="button" className="btn btn-primary text-nowrap mx-1" onClick={onClickGenerateToken}>
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
  onClickDiscardButton: PropTypes.func,
  onClickGenerateToken: PropTypes.func,
};

export default AccessTokenSettings;
