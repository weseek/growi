import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '~/client/services/AppContainer';
import AdminAppContainer from '~/client/services/AdminAppContainer';

function AwsSetting(props) {
  const { t, adminAppContainer } = props;
  const { s3ReferenceFileWithRelayMode } = adminAppContainer.state;

  return (
    <React.Fragment>

      <div className="row form-group my-3">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.file_delivery_method')}
        </label>

        <div className="col-md-6">
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="ddS3ReferenceFileWithRelayMode"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="true"
            >
              {s3ReferenceFileWithRelayMode && t('admin:app_setting.file_delivery_method_relay')}
              {!s3ReferenceFileWithRelayMode && t('admin:app_setting.file_delivery_method_redirect')}
            </button>
            <div className="dropdown-menu" aria-labelledby="ddS3ReferenceFileWithRelayMode">
              <button
                className="dropdown-item"
                type="button"
                onClick={() => { adminAppContainer.changeS3ReferenceFileWithRelayMode(true) }}
              >
                {t('admin:app_setting.file_delivery_method_relay')}
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={() => { adminAppContainer.changeS3ReferenceFileWithRelayMode(false) }}
              >
                { t('admin:app_setting.file_delivery_method_redirect')}
              </button>
            </div>

            <p className="form-text text-muted small">
              {t('admin:app_setting.file_delivery_method_redirect_info')}
              <br />
              {t('admin:app_setting.file_delivery_method_relay_info')}
            </p>
          </div>
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.region')}
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder={`${t('eg')} ap-northeast-1`}
            defaultValue={adminAppContainer.state.s3Region || ''}
            onChange={(e) => {
              adminAppContainer.changeS3Region(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.custom_endpoint')}
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            placeholder={`${t('eg')} http://localhost:9000`}
            defaultValue={adminAppContainer.state.s3CustomEndpoint || ''}
            onChange={(e) => {
              adminAppContainer.changeS3CustomEndpoint(e.target.value);
            }}
          />
          <p className="form-text text-muted">{t('admin:app_setting.custom_endpoint_change')}</p>
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          {t('admin:app_setting.bucket_name')}
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            placeholder={`${t('eg')} crowi`}
            defaultValue={adminAppContainer.state.s3Bucket || ''}
            onChange={(e) => {
              adminAppContainer.changeS3Bucket(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          Access key ID
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            defaultValue={adminAppContainer.state.s3AccessKeyId || ''}
            onChange={(e) => {
              adminAppContainer.changeS3AccessKeyId(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="row form-group">
        <label className="text-left text-md-right col-md-3 col-form-label">
          Secret access key
        </label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            defaultValue={adminAppContainer.state.s3SecretAccessKey || ''}
            onChange={(e) => {
              adminAppContainer.changeS3SecretAccessKey(e.target.value);
            }}
          />
        </div>
      </div>


    </React.Fragment>
  );
}


/**
 * Wrapper component for using unstated
 */
const AwsSettingWrapper = withUnstatedContainers(AwsSetting, [AppContainer, AdminAppContainer]);

AwsSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(AwsSettingWrapper);
