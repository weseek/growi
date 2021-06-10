import React, { FC, Fragment } from 'react';

import { useTranslation } from '~/i18n';

import { SystemInformationTable } from './SystemInformationTable';
import { InstalledPluginTable } from './InstalledPluginTable';
import { EnvVarsTable } from './EnvVarsTable';
import { useEnvVars } from '~/stores/admin-context';

type Props = {
  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,

  installedPlugins: any,
};

export const AdminHome:FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { data: envVars } = useEnvVars();

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
          <SystemInformationTable
            nodeVersion={props.nodeVersion}
            npmVersion={props.npmVersion}
            yarnVersion={props.yarnVersion}
          />
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">{t('admin:admin_top.list_of_installed_plugins')}</h2>
          <InstalledPluginTable installedPlugins={props.installedPlugins} />
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-md-12">
          <h2 className="admin-setting-header">{t('admin:admin_top.list_of_env_vars')}</h2>
          <p>{t('admin:admin_top.env_var_priority')}</p>
          {/* eslint-disable-next-line react/no-danger */}
          <p dangerouslySetInnerHTML={{ __html: t('admin:admin_top.about_security') }} />
          {envVars && <EnvVarsTable envVars={envVars} />}
        </div>
      </div>
    </Fragment>
  );
};
