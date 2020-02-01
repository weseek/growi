import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminHomeContainer from '../../../services/AdminHomeContainer';

class InstalledPluginTable extends React.Component {

  render() {
    const { t, adminHomeContainer } = this.props;

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
          {adminHomeContainer.state.installedPlugins.map((plugin) => {
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
  }

}

InstalledPluginTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminHomeContainer: PropTypes.instanceOf(AdminHomeContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const InstalledPluginTableWrapper = (props) => {
  return createSubscribedElement(InstalledPluginTable, props, [AppContainer, AdminHomeContainer]);
};

export default withTranslation()(InstalledPluginTableWrapper);
