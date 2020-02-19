import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
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
        <p className="well">
          {t('admin:app_setting.aws_access')}
          <br />
          {t('admin:app_setting.no_smtp_setting')}
          <br />
          <br />
          <span className="text-danger">
            <i className="ti-unlink"></i>
            {t('admin:app_setting.change_setting')}
          </span>
        </p>

        <div className="row mb-5">
          <label className="col-xs-3 control-label">
            {t('admin:app_setting.region')}
          </label>
          <div className="col-xs-6">
            <input
              className="form-control"
              placeholder={`${t('eg')} ap-northeast-1`}
              defaultValue={adminAppContainer.state.region || ''}
              onChange={(e) => {
                adminAppContainer.changeRegion(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 control-label">
            {t('admin:app_setting.custom_endpoint')}
          </label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              placeholder={`${t('eg')} http://localhost:9000`}
              defaultValue={adminAppContainer.state.customEndpoint || ''}
              onChange={(e) => {
                adminAppContainer.changeCustomEndpoint(e.target.value);
              }}
            />
            <p className="help-block">{t('admin:app_setting.custom_endpoint_change')}</p>
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 control-label">
            {t('admin:app_setting.bucket_name')}
          </label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              placeholder={`${t('eg')} crowi`}
              defaultValue={adminAppContainer.state.bucket || ''}
              onChange={(e) => {
                adminAppContainer.changeBucket(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 control-label">
            Access Key ID
          </label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.accessKeyId || ''}
              onChange={(e) => {
                adminAppContainer.changeAccessKeyId(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="row mb-5">
          <label className="col-xs-3 control-label">
            Secret Access Key
          </label>
          <div className="col-xs-6">
            <input
              className="form-control"
              type="text"
              defaultValue={adminAppContainer.state.secretAccessKey || ''}
              onChange={(e) => {
                adminAppContainer.changeSecretAccessKey(e.target.value);
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
const AwsSettingWrapper = (props) => {
  return createSubscribedElement(AwsSetting, props, [AppContainer, AdminAppContainer]);
};

AwsSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(AwsSettingWrapper);
