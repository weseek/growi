import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';

function AwsSetting(props) {
  const { t, adminAppContainer } = props;

  return (
    <React.Fragment>
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
