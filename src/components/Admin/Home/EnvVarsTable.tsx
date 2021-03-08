import React, { FC } from 'react';

type Props = {
  envVars: {
    key: string,
    value: any,
  },
}

export const EnvVarsTable:FC<Props> = (props: Props) => {
  const envVarRows:JSX.Element[] = [];

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
