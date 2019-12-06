import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

const logger = loggerFactory('growi:appSettings');

class SiteUrlSetting extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      siteUrl: '',
      envSiteUrl: '',
    };

    this.submitHandler = this.submitHandler.bind(this);
    this.inputSiteUrlChangeHandler = this.inputSiteUrlChangeHandler.bind(this);
  }

  async componentDidMount() {
    try {
      const response = await this.props.appContainer.apiv3.get('/app-settings/');
      const appSettingParams = response.data.appSettingParams;

      this.setState({
        siteUrl: appSettingParams.siteUrl || '',
        envSiteUrl: appSettingParams.envSiteUrl || '',
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
      siteUrl: this.state.siteUrl,
    };

    try {
      await this.props.appContainer.apiv3.put('/app-settings/site-url-setting', params);
      toastSuccess(t('app_setting.updated_site_url'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  inputSiteUrlChangeHandler(event) {
    this.setState({ siteUrl: event.target.value });
  }

  renderWarningMessage() {
    const { t } = this.props;

    if (this.state.siteUrl) {
      return (<p className="alert alert-danger"><i className="icon-exclamation"></i> {t('app_setting.Site URL warn')}</p>);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <React.Fragment>
        <p className="well">{t('app_setting.Site URL desc')}</p>
        <div className="row">
          <div className="col-md-12">
            <div className="col-xs-offset-3">
              <table className="table settings-table">
                <colgroup>
                  <col className="from-db" />
                  <col className="from-env-vars" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Database</th>
                    <th>Environment variables</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <input
                        className="form-control"
                        type="text"
                        name="settingForm[app:siteUrl]"
                        value={this.state.siteUrl}
                        onChange={this.inputSiteUrlChangeHandler}
                        placeholder="e.g. https://my.growi.org"
                      />
                      <p className="help-block">
                        {/* eslint-disable-next-line react/no-danger */}
                        <div dangerouslySetInnerHTML={{ __html: t('app_setting.siteurl_help') }} />
                      </p>
                    </td>
                    <td>
                      <input className="form-control" type="text" value={this.state.envSiteUrl} readOnly />
                      <p className="help-block">
                        {/* eslint-disable-next-line react/no-danger */}
                        <div dangerouslySetInnerHTML={{ __html: t('app_setting.Use env var if empty', { variable: 'APP_SITE_URL' }) }} />
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
const SiteUrlSettingWrapper = (props) => {
  return createSubscribedElement(SiteUrlSetting, props, [AppContainer]);
};

SiteUrlSetting.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(SiteUrlSettingWrapper);
