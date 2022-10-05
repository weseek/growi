import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'next-i18next';

import AdminHomeContainer from '~/client/services/AdminHomeContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

const InstalledPluginTable = (props) => {
  const { t } = useTranslation();
  const { adminHomeContainer } = props;

  const { installedPlugins } = adminHomeContainer.state;

  if (installedPlugins == null) {
    return <></>;
  }

  return (
    <table data-testid="admin-installed-plugin-table" className="table table-bordered">
      <thead>
        <tr>
          <th className="text-center">{t('admin:admin_top.package_name')}</th>
          <th className="text-center">{t('admin:admin_top.specified_version')}</th>
          <th className="text-center">{t('admin:admin_top.installed_version')}</th>
        </tr>
      </thead>
      <tbody>
        {adminHomeContainer.state.installedPlugins.map((plugin) => {
          return (
            <tr key={plugin.name}>
              <td>{plugin.name}</td>
              <td data-hide-in-vrt className="text-center">{plugin.requiredVersion}</td>
              <td data-hide-in-vrt className="text-center">{plugin.installedVersion}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

};

InstalledPluginTable.propTypes = {
  adminHomeContainer: PropTypes.instanceOf(AdminHomeContainer).isRequired,
};


/**
 * Wrapper component for using unstated
 */
const InstalledPluginTableWrapper = withUnstatedContainers(InstalledPluginTable, [AdminHomeContainer]);

export default InstalledPluginTableWrapper;
