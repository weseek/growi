import React, { Fragment } from 'react';

import { useTranslation } from '~/i18n';
import { useAdminHomeSWR } from '~/stores/admin';

import SystemInfomationTable from '../../../client/js/components/Admin/AdminHome/SystemInfomationTable';
import InstalledPluginTable from '../../../client/js/components/Admin/AdminHome/InstalledPluginTable';
import EnvVarsTable from '../../../client/js/components/Admin/AdminHome/EnvVarsTable';

export type adminHomeParams = {
  growiVersion: string,
  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
  installedPlugins: string,
  envVars: string,
}
const AdminHome = (): JSX.Element => {
  const { t } = useTranslation();
  const { data, isValidating } = useAdminHomeSWR();

  if (isValidating) {
    return <></>;
  }

  console.log(data);
  return (
    <Fragment>
      <p>
        {t('admin:admin_top.wiki_administrator')}
        <br></br>
        {t('admin:admin_top.assign_administrator')}
      </p>

      <div className="row mb-5">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">{t('admin:admin_top.system_information')}</h2>
          <SystemInfomationTable
            nodeVersion={data?.nodeVersion}
            npmVersion={data?.npmVersion}
            yarnVersion={data?.yarnVersion}
          />
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">{t('admin:admin_top.list_of_installed_plugins')}</h2>
          <InstalledPluginTable installedPlugins={data?.installedPlugins} />
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-md-12">
          <h2 className="admin-setting-header">{t('admin:admin_top.list_of_env_vars')}</h2>
          <p>{t('admin:admin_top.env_var_priority')}</p>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('admin:admin_top.about_security') }} />
          {data?.envVars && <EnvVarsTable envVars={data?.envVars} />}
        </div>
      </div>
    </Fragment>
  );
};

export default AdminHome;
