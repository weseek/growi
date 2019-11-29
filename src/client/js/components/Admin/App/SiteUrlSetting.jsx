import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

const logger = loggerFactory('growi:importer');

class SiteUrlSetting extends React.Component {

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
        <p className="well">{t('app_setting.Site URL desc')}</p>
        {/* {% if !getConfig('crowi', 'app:siteUrl') %}
              <p class="alert alert-danger"><i class="icon-exclamation"></i> {{ t('app_setting.Site URL warn') }}</p>
        {% endif %} */}

        <div className="row">
          <div className="col-md-12">
            <div className="col-xs-offset-3">
              <table className="table settings-table">
                <colgroup>
                  <col className="from-db" />
                  <col className="from-env-vars" />
                </colgroup>
                <thead>
                  <tr><th>Database</th><th>Environment variables</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input
                        className="form-control"
                        type="text"
                        name="settingForm[app:siteUrl]"
                        value="{{ getConfigFromDB('crowi', 'app:siteUrl') | default('') }}"
                        placeholder="e.g. https://my.growi.org"
                      />
                      <p className="help-block">{t('app_setting.siteurl_help')}</p>
                    </td>
                    <td>
                      <input
                        className="form-control"
                        type="text"
                        value="{{ getConfigFromEnvVars('crowi', 'app:siteUrl') | default('') }}"
                        readOnly
                      />
                      <p className="help-block">
                        {t('app_setting.Use env var if empty', 'APP_SITE_URL')}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
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
const SiteUrlSettingWrapper = (props) => {
  return createSubscribedElement(SiteUrlSetting, props, [AppContainer]);
};

SiteUrlSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(SiteUrlSettingWrapper);
