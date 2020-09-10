import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';

const logger = loggerFactory('growi:appSettings');

class AwsSetting extends React.Component {

  constructor(props) {
    super(props);

    this.submitHandler = this.submitHandler.bind(this);
  }

  async submitHandler() {
    const { t, adminAppContainer } = this.props;

    try {
      await adminAppContainer.updateAwsSettingHandler();
      toastSuccess(t('toaster.update_successed', { target: t('admin:app_setting.aws_settings') }));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminAppContainer } = this.props;

    return (
      <React.Fragment>
        <p className="card well">
          {t('admin:app_setting.aws_access')}
          <br />
          <span className="text-danger">
            <i className="ti-unlink"></i>
            {t('admin:app_setting.change_setting')}
          </span>
        </p>

        <div className="row form-group">
          <label className="text-left text-md-right col-md-3 col-form-label">
            {t('admin:app_setting.region')}
          </label>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder={`${t('eg')} ap-northeast-1`}
              defaultValue={adminAppContainer.state.awsS3Region || ''}
              onChange={(e) => {
                adminAppContainer.changeAwsS3Region(e.target.value);
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
              defaultValue={adminAppContainer.state.awsCustomEndpoint || ''}
              onChange={(e) => {
                adminAppContainer.changeAwsCustomEndpoint(e.target.value);
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
              defaultValue={adminAppContainer.state.awsBucket || ''}
              onChange={(e) => {
                adminAppContainer.changeAwsBucket(e.target.value);
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
              defaultValue={adminAppContainer.state.awsAccessKeyId || ''}
              onChange={(e) => {
                adminAppContainer.changeAwsAccessKeyId(e.target.value);
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
              defaultValue={adminAppContainer.state.awsSecretAccessKey || ''}
              onChange={(e) => {
                adminAppContainer.changeAwsSecretAccessKey(e.target.value);
              }}
            />
          </div>
        </div>

        <AdminUpdateButtonRow onClick={this.submitHandler} disabled={adminAppContainer.state.retrieveError != null} />
      </React.Fragment>
    );
  }

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
