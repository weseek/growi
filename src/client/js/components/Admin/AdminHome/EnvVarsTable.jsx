import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import AdminHomeContainer from '../../../services/AdminHomeContainer';

class EnvVarsTable extends React.Component {

  render() {
    const { adminHomeContainer } = this.props;

    return (
      <table className="table table-bordered">
        <tbody>
          {Object.entries(adminHomeContainer.state.envVars.crowi).map((env) => {
            if (env[1] == null) { return null }
            return (
              <tr key={env[0]}>
                <th className="col-sm-4">{env[0]}</th>
                <td>{env[1].toString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

}

EnvVarsTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminHomeContainer: PropTypes.instanceOf(AdminHomeContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const EnvVarsTableWrapper = (props) => {
  return createSubscribedElement(EnvVarsTable, props, [AppContainer, AdminHomeContainer]);
};

export default withTranslation()(EnvVarsTableWrapper);
