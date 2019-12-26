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
            <th className="text-center">{ t('admin_top.Package name') }</th>
            <th className="text-center">{ t('admin_top.Specified version') }</th>
            <th className="text-center">{ t('admin_top.Installed version') }</th>
          </tr>
        </thead>
        <tbody>
          { Object.keys(adminHomeContainer.state.installedPlugins).map((pluginName) => {
            return (
              <tr key={pluginName}>
                <td>{ pluginName }</td>
                <td className="text-center">{ adminHomeContainer.state.installedPlugins[pluginName] }</td>
                <td className="text-center"><span className="tbd">(TBD)</span></td>
              </tr>
            );
          }) }
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
