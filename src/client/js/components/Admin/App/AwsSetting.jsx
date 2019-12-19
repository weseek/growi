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
      toastSuccess(t('app_setting.updated_app_setting'));
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
          {t('app_setting.AWS_access')}
          <br />
          {t('app_setting.No_SMTP_setting')}
          <br />
          <br />
          <span className="text-danger">
            <i className="ti-unlink"></i>
            {t('app_setting.change_setting')}
          </span>
        </p>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[app:region]" className="col-xs-3 control-label">
                {t('app_setting.region')}
              </label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[app:region]"
                  type="text"
                  name="settingForm[aws:region]"
                  placeholder={`${t('eg')} ap-northeast-1`}
                  defaultValue={adminAppContainer.state.region}
                  onChange={(e) => {
                    adminAppContainer.changeRegion(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[aws:customEndpoint]" className="col-xs-3 control-label">
                {t('app_setting.custom endpoint')}
              </label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[aws:customEndpoint]"
                  type="text"
                  name="settingForm[aws:customEndpoint]"
                  placeholder={`${t('eg')} http://localhost:9000`}
                  defaultValue={adminAppContainer.state.customEndpoint}
                  onChange={(e) => {
                    adminAppContainer.changeCustomEndpoint(e.target.value);
                  }}
                />
                <p className="help-block">{t('app_setting.custom_endpoint_change')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[aws:bucket]" className="col-xs-3 control-label">
                {t('app_setting.bucket name')}
              </label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[aws:bucket]"
                  type="text"
                  name="settingForm[aws:bucket]"
                  placeholder={`${t('eg')} crowi`}
                  defaultValue={adminAppContainer.state.bucket}
                  onChange={(e) => {
                    adminAppContainer.changeBucket(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[aws:accessKeyId]" className="col-xs-3 control-label">
                Access Key ID
              </label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[aws:accessKeyId]"
                  type="text"
                  name="settingForm[aws:accessKeyId]"
                  defaultValue={adminAppContainer.state.accessKeyId}
                  onChange={(e) => {
                    adminAppContainer.changeAccessKeyId(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[aws:secretAccessKey]" className="col-xs-3 control-label">
                Secret Access Key
              </label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[aws:secretAccessKey]"
                  type="text"
                  name="settingForm[aws:secretAccessKey]"
                  defaultValue={adminAppContainer.state.secretKey}
                  onChange={(e) => {
                    adminAppContainer.changeSecretKey(e.target.value);
                  }}
                />
              </div>
            </div>
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
