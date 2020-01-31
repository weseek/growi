import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminHomeContainer from '../../../services/AdminHomeContainer';

class SystemInformationTable extends React.Component {

  render() {
    const { adminHomeContainer } = this.props;

    return (
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th className="col-sm-4">GROWI</th>
            <td>{ adminHomeContainer.state.growiVersion }</td>
          </tr>
          <tr>
            <th>node.js</th>
            <td>{ adminHomeContainer.state.nodeVersion }</td>
          </tr>
          <tr>
            <th>npm</th>
            <td>{ adminHomeContainer.state.npmVersion }</td>
          </tr>
          <tr>
            <th>yarn</th>
            <td>{ adminHomeContainer.state.yarnVersion }</td>
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
const SystemInformationTableWrapper = (props) => {
  return createSubscribedElement(SystemInformationTable, props, [AppContainer, AdminHomeContainer]);
};

export default withTranslation()(SystemInformationTableWrapper);
