import Link from 'next/link';

import { useSWRxCmsNamespaces } from '../../stores/cms-namespace';

export const CmsList = (): JSX.Element => {
  const { data } = useSWRxCmsNamespaces();

  if (data == null) { // data should be not null by `suspense: true`
    return <></>;
  }

  return (
    <table className="table table-bordered grw-duplicated-paths-table">
      <thead>
        <tr>
          <th className="col-4">namespace</th>
          <th>desc</th>
        </tr>
      </thead>
      <tbody className="overflow-auto">
        {data.map((cmsNamespace) => {
          const { namespace, desc } = cmsNamespace;
          return (
            <tr key={namespace}>
              <td>
                <Link href={`/_cms/${namespace}`} prefetch={false}>
                  {namespace}
                </Link>
              </td>
              <td>
                {desc}
              </td>
            </tr>
          );
        })}
        <tr>
          <td colSpan={2} className="text-center">
            <button type="button" className="btn btn-outline-secondary">
              <span className="icon icon-plus" /> Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
