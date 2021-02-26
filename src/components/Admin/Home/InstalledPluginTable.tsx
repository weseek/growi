import React from 'react';
import { useTranslation } from '~/i18n';

// type InstalledPlugins = {

// };
type Props = {
  installedPlugins: any,
};

export const InstalledPluginTable = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th className="text-center">{t('admin:admin_top.package_name')}</th>
          <th className="text-center">{t('admin:admin_top.specified_version')}</th>
          <th className="text-center">{t('admin:admin_top.installed_version')}</th>
        </tr>
      </thead>
      <tbody>
        {props.installedPlugins.map((plugin) => {
          return (
            <tr key={plugin.name}>
              <td>{plugin.name}</td>
              <td className="text-center">{plugin.requiredVersion}</td>
              <td className="text-center">{plugin.installedVersion}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
