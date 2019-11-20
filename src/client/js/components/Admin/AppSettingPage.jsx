import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { createSubscribedElement } from '../UnstatedUtils';

import AppContainer from '../../services/AppContainer';

import AppSetting from './App/AppSetting';
import SiteUrlSetting from './App/SiteUrlSetting';
import MailSetting from './App/MailSetting';
import AwsSetting from './App/AwsSetting';
import PluginSetting from './App/PluginSetting';

class AppSettingPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="row">
          <div className="col-md-12">
            <h2>{t('App Settings')}</h2>
            <AppSetting />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <h2>{t('Site URL settings')}</h2>
            <SiteUrlSetting />
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
    );
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
