import React from 'react';

import AdminHomeContainer from '~/client/services/AdminHomeContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';


type Props = {
  adminHomeContainer: AdminHomeContainer,
}

const SystemInformationTable = (props: Props) => {
  const { adminHomeContainer } = props;

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
          <td data-vrt-blackout>{ growiVersion }</td>
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

};

/**
 * Wrapper component for using unstated
 */
const SystemInformationTableWrapper = withUnstatedContainers(SystemInformationTable, [AdminHomeContainer]);

export default SystemInformationTableWrapper;
