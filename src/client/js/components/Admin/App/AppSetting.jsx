import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

const logger = loggerFactory('growi:appSettings');

class AppSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      title: '',
      confidential: '',
      globalLang: 'en-US',
      fileUpload: false,
    };

    this.submitHandler = this.submitHandler.bind(this);
    this.inputChangeHandler = this.inputChangeHandler.bind(this);
    this.inputCheckBoxChangeHandler = this.inputCheckBoxChangeHandler.bind(this);
  }

  async componentDidMount() {
    try {
      const response = await this.props.appContainer.apiv3.get('/app-settings/app-setting');
      const appSettingParams = response.data.appSettingParams;

      this.setState({
        title: appSettingParams.title || '',
        confidential: appSettingParams.confidential || '',
        globalLang: appSettingParams.globalLang || 'en-US',
        fileUpload: appSettingParams.fileUpload || false,
      });
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  async submitHandler() {
    const { t } = this.props;

    const params = {
      title: this.state.title,
      confidential: this.state.confidential,
      globalLang: this.state.globalLang,
      fileUpload: this.state.fileUpload,
    };

    try {
      await this.props.appContainer.apiv3.put('/app-settings/app-setting', params);
      toastSuccess(t('Updated app setting'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  inputChangeHandler(event) {
    const target = event.target;
    this.setState({ [target.name]: target.value });
  }

  inputCheckBoxChangeHandler(event) {
    const target = event.target;
    this.setState({ [target.name]: target.checked });
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label className="col-xs-3 control-label">{t('app_setting.Site Name')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[app:title]"
                  type="text"
                  name="title"
                  value={this.state.title}
                  onChange={this.inputChangeHandler}
                  placeholder="GROWI"
                />
                <p className="help-block">{t('app_setting.sitename_change')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label className="col-xs-3 control-label">{t('app_setting.Confidential name')}</label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[app:confidential]"
                  type="text"
                  name="confidential"
                  value={this.state.confidential}
                  onChange={this.inputChangeHandler}
                  placeholder={t('app_setting.ex) internal use only')}
                />
                <p className="help-block">{t('app_setting.header_content')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="col-xs-3 control-label">{t('app_setting.Default Language for new users')}</label>
          <div className="col-xs-6">
            <div className="radio radio-primary radio-inline">
              <input
                type="radio"
                id="radioLangEn"
                name="globalLang"
                value="en-US"
                checked={this.state.globalLang === 'en-US'}
                onClick={this.inputChangeHandler}
              />
              <label>{t('English')}</label>
            </div>
            <div className="radio radio-primary radio-inline">
              <input type="radio" id="radioLangJa" name="globalLang" value="ja" checked={this.state.globalLang === 'ja'} onClick={this.inputChangeHandler} />
              <label>{t('Japanese')}</label>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label className="col-xs-3 control-label">{t('app_setting.File Uploading')}</label>
              <div className="col-xs-6">
                <div className="checkbox checkbox-info">
                  <input type="checkbox" id="cbFileUpload" name="fileUpload" checked={this.state.fileUpload} onChange={this.inputCheckBoxChangeHandler} />
                  <label>{t('app_setting.enable_files_except_image')}</label>
                </div>

                <p className="help-block">
                  {t('app_setting.enable_files_except_image')}
                  <br />
                  {t('app_setting.attach_enable')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <div className="col-xs-offset-3 col-xs-6">
                <button type="submit" className="btn btn-primary" onClick={this.submitHandler}>
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
const AppSettingWrapper = (props) => {
  return createSubscribedElement(AppSetting, props, [AppContainer]);
};

AppSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(AppSettingWrapper);
