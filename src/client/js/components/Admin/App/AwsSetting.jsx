import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

const logger = loggerFactory('growi:importer');

class AwsSetting extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;

    this.state = {
    };
  }


  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <p className="well">{t('app_setting.AWS_access') }<br />
          { t('app_setting.No_SMTP_setting') }<br />
          <br />

          <span className="text-danger"><i className="ti-unlink"></i> {t('app_setting.change_setting') }</span>
        </p>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[app:region]" className="col-xs-3 control-label">{ t('app_setting.region') }</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[app:region]"
                  type="text"
                  name="settingForm[aws:region]"
                  placeholder="例: ap-northeast-1"
                  value="{{ getConfig('crowi', 'aws:region') | default('') }}"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[aws:customEndpoint]" className="col-xs-3 control-label">{ t('app_setting.custom endpoint') }</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[aws:customEndpoint]"
                  type="text"
                  name="settingForm[aws:customEndpoint]"
                  placeholder="例: http://localhost:9000"
                  value="{{ getConfig('crowi', 'aws:customEndpoint') | default('') }}"
                />
                <p className="help-block">{ t('app_setting.custom_endpoint_change') }</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[aws:bucket]" className="col-xs-3 control-label">{t('app_setting.bucket name')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[aws:bucket]"
                  type="text"
                  name="settingForm[aws:bucket]"
                  placeholder="例: crowi"
                  value="{{ getConfig('crowi', 'aws:bucket') | default('') }}"
                />
              </div>
            </div>
          </div>
        </div>


        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[aws:accessKeyId]" className="col-xs-3 control-label">Access Key ID</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[aws:accessKeyId]"
                  type="text"
                  name="settingForm[aws:accessKeyId]"
                  value="{{ getConfig('crowi', 'aws:accessKeyId') | default('') }}"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[aws:secretAccessKey]" className="col-xs-3 control-label">Secret Access Key</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[aws:secretAccessKey]"
                  type="text"
                  name="settingForm[aws:secretAccessKey]"
                  value="{{ getConfig('crowi', 'aws:secretAccessKey') | default('') }}"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <div className="col-xs-offset-3 col-xs-6">
                <input type="hidden" name="_csrf" value="{{ csrf() }}" />
                <button type="submit" className="btn btn-primary">
                  {t('app_setting.Update')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const AwsSettingWrapper = (props) => {
  return createSubscribedElement(AwsSetting, props, [AppContainer]);
};

AwsSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(AwsSettingWrapper);
