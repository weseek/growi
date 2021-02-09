import React, { Fragment } from 'react';

import { useTranslation } from '~/i18n';

import { AppSetting } from '~/components/Admin/App/AppSetting';
import SiteUrlSetting from '~/client/js/components/Admin/App//SiteUrlSetting';
import MailSetting from '~/client/js/components/Admin/App//MailSetting';
import PluginSetting from '~/client/js/components/Admin/App//PluginSetting';
import FileUploadSetting from '~/client/js/components/Admin/App//FileUploadSetting';

const AppSettingsPageContents = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Fragment>
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

};

export default AppSettingsPageContents;
