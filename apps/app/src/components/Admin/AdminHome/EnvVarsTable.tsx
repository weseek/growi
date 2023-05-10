import React from 'react';

import PropTypes from 'prop-types';

type EnvVarsTableProps = {
  envVars: object,
}

const EnvVarsTable: React.FC<EnvVarsTableProps> = (props: EnvVarsTableProps) => {
  const envVarRows: JSX.Element[] = [];

  for (const [key, value] of Object.entries(props.envVars)) {
    if (value != null) {
      envVarRows.push(
        <tr key={key}>
          <th className="col-sm-4">{key}</th>
          <td>{value.toString()}</td>
        </tr>,
      );
    }
  }

  return (
    <table className="table table-bordered">
      <tbody>
        {envVarRows}
      </tbody>
    </table>
  );
};

EnvVarsTable.propTypes = {
  envVars: PropTypes.object.isRequired,
};

export default EnvVarsTable;
