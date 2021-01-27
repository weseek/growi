type Props = {
  growiVersion: string,
  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
};

const SystemInformationTable = (props: Props): JSX.Element => {

  return (
    <table className="table table-bordered">
      <tbody>
        <tr>
          <th>GROWI</th>
          <td>{ props.growiVersion }</td>
        </tr>
        <tr>
          <th>node.js</th>
          <td>{ props.nodeVersion }</td>
        </tr>
        <tr>
          <th>npm</th>
          <td>{ props.npmVersion }</td>
        </tr>
        <tr>
          <th>yarn</th>
          <td>{ props.yarnVersion }</td>
        </tr>
      </tbody>
    </table>
  );
};

export default SystemInformationTable;
