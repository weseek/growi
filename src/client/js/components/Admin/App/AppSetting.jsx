import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

const logger = loggerFactory('growi:importer');

class AppSetting extends React.Component {

  constructor(props) {
    super(props);

    const { appContainer } = this.props;

    this.state = {
      siteName: appContainer.config.crowi.title,
      confidentialName: appContainer.config.confidential,
      globalLang: appContainer.config.globalLang,
      fileUpload: appContainer.config.fileUpload,
    };

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t } = this.props;

    const params = {
      'app:title': this.state.siteName,
      'app:confidential': this.state.confidentialName,
      'app:globalLang': this.state.globalLang,
      'app:fileUpload': this.state.fileUpload,
    };

    try {
      await this.appContainer.apiPost('/admin/settings/app', params);
      toastSuccess(t('app_setting.updated_app_setting'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label htmlFor="settingForm[app:title]" className="col-xs-3 control-label">
                {t('app_setting.Site Name')}
              </label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[app:title]"
                  type="text"
                  name="settingForm[app:title]"
                  value="{{ getConfig('crowi', 'app:title') | default('') }}"
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
              <label htmlFor="settingForm[app:confidential]" className="col-xs-3 control-label">
                {t('app_setting.Confidential name')}
              </label>
              <div className="col-xs-6">
                <input
                  className="form-control"
                  id="settingForm[app:confidential]"
                  type="text"
                  name="settingForm[app:confidential]"
                  value="{{ getConfig('crowi', 'app:confidential') | default('') }}"
                  placeholder="{{ t('app_setting. ex&rpar;: internal use only') }}"
                />
                <p className="help-block">{t('app_setting.header_content')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="form-group">
              <label className="col-xs-3 control-label">{t('app_setting.File Uploading')}</label>
              <div className="col-xs-6">
                <div className="checkbox checkbox-info">
                  <input type="checkbox" id="cbFileUpload" name="settingForm[app:fileUpload]" value="1" />
                  <label htmlFor="cbFileUpload">{t('app_setting.enable_files_except_image')}</label>
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
const AppSettingWrapper = (props) => {
  return createSubscribedElement(AppSetting, props, [AppContainer]);
};

AppSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(AppSettingWrapper);
