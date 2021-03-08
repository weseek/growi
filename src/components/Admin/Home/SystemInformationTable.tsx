import { useGrowiVersion } from '~/stores/context';

type Props = {
  nodeVersion: string,
  npmVersion: string,
  yarnVersion: string,
};

export const SystemInformationTable = (props: Props): JSX.Element => {
  const { data: growiVersion } = useGrowiVersion();
  return (
    <table className="table table-bordered">
      <tbody>
        <tr>
          <th>GROWI</th>
          <td>{ growiVersion }</td>
        </tr>
        <tr>
          <th>node.js</th>
          <td>{ props.nodeVersion || '-' }</td>
        </tr>
        <tr>
          <th>npm</th>
          <td>{ props.npmVersion || '-' }</td>
        </tr>
        <tr>
          <th>yarn</th>
          <td>{ props.yarnVersion || '-' }</td>
        </tr>
      </tbody>
    </table>
  );
};
