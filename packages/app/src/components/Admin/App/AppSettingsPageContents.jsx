import React, { Fragment } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppSetting from './AppSetting';
import SiteUrlSetting from './SiteUrlSetting';
import MailSetting from './MailSetting';
import PluginSetting from './PluginSetting';
import FileUploadSetting from './FileUploadSetting';
import { V5PageMigration } from './V5PageMigration';

import AdminAppContainer from '~/client/services/AdminAppContainer';

class AppSettingsPageContents extends React.Component {

  render() {
    const { t, adminAppContainer } = this.props;
    const { isV5Compatible } = adminAppContainer.state;

    return (
      <Fragment>
        {
          !isV5Compatible
          && (
            <div className="row">
              <div className="col-lg-12">
                <h2 className="admin-setting-header">V5 Page Migration</h2>
                <V5PageMigration isV5Compatible={isV5Compatible} />
              </div>
            </div>
          )
        }

        <div className="row">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">{t('App Settings')}</h2>
            <AppSetting />
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">{t('Site URL settings')}</h2>
            <SiteUrlSetting />
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">{t('admin:app_setting.mail_settings')}</h2>
            <MailSetting />
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">{t('admin:app_setting.file_upload_settings')}</h2>
            <FileUploadSetting />
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">{t('admin:app_setting.plugin_settings')}</h2>
            <PluginSetting />
          </div>
        </div>
      </Fragment>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const AppSettingsPageContentsWrapper = withUnstatedContainers(AppSettingsPageContents, [AdminAppContainer]);

AppSettingsPageContents.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer).isRequired,
};

export default withTranslation()(AppSettingsPageContentsWrapper);
