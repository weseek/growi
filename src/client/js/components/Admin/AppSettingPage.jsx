import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import loggerFactory from '@alias/logger';

import { createSubscribedElement } from '../UnstatedUtils';
import { toastError } from '../../util/apiNotification';

import AppContainer from '../../services/AppContainer';

import AppSetting from './App/AppSetting';
import SiteUrlSetting from './App/SiteUrlSetting';
import MailSetting from './App/MailSetting';
import AwsSetting from './App/AwsSetting';
import PluginSetting from './App/PluginSetting';

const logger = loggerFactory('growi:appSettings');

class AppSettingPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      title: '',
      confidential: '',
      globalLang: '',
      fileUpload: '',
      siteUrl: '',
      envSiteUrl: '',
      isSetSiteUrl: true,
    };

  }

  async componentDidMount() {
    try {
      const response = await this.props.appContainer.apiv3.get('/app-settings/');
      const appSettingParams = response.data.appSettingParams;

      this.setState({
        isLoading: false,
        title: appSettingParams.title || '',
        confidential: appSettingParams.confidential || '',
        globalLang: appSettingParams.globalLang || 'en-US',
        fileUpload: appSettingParams.fileUpload || false,
        siteUrl: appSettingParams.siteUrl || appSettingParams.envSiteUrl || '',
        envSiteUrl: appSettingParams.envSiteUrl || '',
        isSetSiteUrl: !!appSettingParams.siteUrl,
      });
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t } = this.props;

    return !this.state.isLoading ? (
      <Fragment>
        <div className="row">
          <div className="col-md-12">
            <h2>{t('App Settings')}</h2>
            <AppSetting
              title={this.state.title}
              confidential={this.state.confidential}
              globalLang={this.state.globalLang}
              fileUpload={this.state.fileUpload}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h2>{t('Site URL settings')}</h2>
            <SiteUrlSetting
              siteUrl={this.state.siteUrl}
              envSiteUrl={this.state.envSiteUrl}
              isSetSiteUrl={this.state.isSetSiteUrl}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h2>{t('app_setting.Mail settings')}</h2>
            <MailSetting />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h2>{t('app_setting.AWS settings')}</h2>
            <AwsSetting />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h2>{t('app_setting.Plugin settings')}</h2>
            <PluginSetting />
          </div>
        </div>
      </Fragment>
    ) : null;
  }

}

AppSettingPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const AppSettingPageWrapper = (props) => {
  return createSubscribedElement(AppSettingPage, props, [AppContainer]);
};


export default withTranslation()(AppSettingPageWrapper);
