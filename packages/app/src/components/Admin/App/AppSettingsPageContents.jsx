import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppSetting from './AppSetting';
import SiteUrlSetting from './SiteUrlSetting';
import MailSetting from './MailSetting';
import PluginSetting from './PluginSetting';
import FileUploadSetting from './FileUploadSetting';
import V5PageMigration from './V5PageMigration';
import MaintenanceMode from './MaintenanceMode';

import AdminAppContainer from '~/client/services/AdminAppContainer';

class AppSettingsPageContents extends React.Component {

  render() {
    const { t, adminAppContainer } = this.props;
    const { isV5Compatible } = adminAppContainer.state;

    return (
      <div data-testid="admin-app-settings">
        {
          // Alert message will be displayed in case that the GROWI is under maintenance
          adminAppContainer.state.isMaintenanceMode && (
            <div className="alert alert-danger alert-link" role="alert">
              <h3 className="alert-heading">
                {t('maintenance_mode.maintenance_mode')}
              </h3>
              <p>
                {t('maintenance_mode.description')}
              </p>
              <hr />
              <a className="btn-link" href="#maintenance-mode" rel="noopener noreferrer">
                <i className="fa fa-fw fa-arrow-down ml-1" aria-hidden="true"></i>
                <strong>{t('maintenance_mode.end_maintenance_mode')}</strong>
              </a>
            </div>
          )
        }
        {
          !isV5Compatible
          && (
            <div className="row">
              <div className="col-lg-12">
                <h2 className="admin-setting-header">{t('V5 Page Migration')}</h2>
                <V5PageMigration />
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
            <h2 className="admin-setting-header" id="mail-settings">{t('admin:app_setting.mail_settings')}</h2>
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

        <div className="row">
          <div className="col-lg-12">
            <h2 className="admin-setting-header" id="maintenance-mode">{t('Maintenance Mode')}</h2>
            <MaintenanceMode />
          </div>
        </div>

      </div>

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
