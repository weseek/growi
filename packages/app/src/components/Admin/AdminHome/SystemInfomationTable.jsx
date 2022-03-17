import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import AdminHomeContainer from '~/client/services/AdminHomeContainer';

class SystemInformationTable extends React.Component {

  render() {
    const { adminHomeContainer } = this.props;

    const {
      growiVersion, nodeVersion, npmVersion, yarnVersion,
    } = adminHomeContainer.state;

    if (growiVersion == null || nodeVersion == null || npmVersion == null || yarnVersion == null) {
      return <></>;
    }

    return (
      <table data-testid="admin-system-information-table" className="table table-bordered">
        <tbody>
          <tr>
            <th>GROWI</th>
            <td data-hide-in-vrt>{ growiVersion }</td>
          </tr>
          <tr>
            <th>node.js</th>
            <td>{ nodeVersion }</td>
          </tr>
          <tr>
            <th>npm</th>
            <td>{ npmVersion }</td>
          </tr>
          <tr>
            <th>yarn</th>
            <td>{ yarnVersion }</td>
          </tr>
        </tbody>
      </table>
    );
  }

}

SystemInformationTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminHomeContainer: PropTypes.instanceOf(AdminHomeContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const SystemInformationTableWrapper = withUnstatedContainers(SystemInformationTable, [AppContainer, AdminHomeContainer]);

export default withTranslation()(SystemInformationTableWrapper);
