import React from 'react';

import { useTranslation } from 'react-i18next';

import AdminAppContainer from '~/client/services/AdminAppContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AppSetting from './AppSetting';
import FileUploadSetting from './FileUploadSetting';
import MailSetting from './MailSetting';
import MaintenanceMode from './MaintenanceMode';
import PluginSetting from './PluginSetting';
import SiteUrlSetting from './SiteUrlSetting';
import V5PageMigration from './V5PageMigration';

type Props = {
  adminAppContainer: AdminAppContainer,
}

const AppSettingsPageContents = (props: Props) => {
  const { t } = useTranslation();
  const { adminAppContainer } = props;
  const { isV5Compatible } = adminAppContainer.state;

  return (
    <div data-testid="admin-app-settings">
      {
        // Alert message will be displayed in case that the GROWI is under maintenance
        adminAppContainer.state.isMaintenanceMode && (
          <div className="alert alert-danger alert-link" role="alert">
            <h3 className="alert-heading">
              {t('admin:maintenance_mode.maintenance_mode')}
            </h3>
            <p>
              {t('admin:maintenance_mode.description')}
            </p>
            <hr />
            <a className="btn-link" href="#maintenance-mode" rel="noopener noreferrer">
              <i className="fa fa-fw fa-arrow-down ml-1" aria-hidden="true"></i>
              <strong>{t('admin:maintenance_mode.end_maintenance_mode')}</strong>
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
          <h2 className="admin-setting-header" id="maintenance-mode">{t('admin:maintenance_mode.maintenance_mode')}</h2>
          <MaintenanceMode />
        </div>
      </div>
    </div>
  );
};

/**
 * Wrapper component for using unstated
 */
const AppSettingsPageContentsWrapper = withUnstatedContainers(AppSettingsPageContents, [AdminAppContainer]);

export default AppSettingsPageContentsWrapper;
