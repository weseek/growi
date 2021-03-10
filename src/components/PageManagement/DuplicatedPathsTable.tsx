import { VFC } from 'react';

import { useTranslation } from '~/i18n';
import { convertToNewAffiliationPath } from '~/utils/path-utils';

type Props={
  path: string,
  oldPagePath: string,
  existingPaths: string[],
}

export const DuplicatedPathsTable:VFC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    path, oldPagePath, existingPaths,
  } = props;

  return (
    <table className="table table-bordered grw-duplicated-paths-table">
      <thead>
        <tr className="d-flex">
          <th className="w-50">{t('original_path')}</th>
          <th className="w-50 text-danger">{t('duplicated_path')}</th>
        </tr>
      </thead>
      <tbody className="overflow-auto d-block">
        {existingPaths.map((existPath) => {
          const convertedPath = convertToNewAffiliationPath(oldPagePath, path, existPath);
          return (
            <tr key={existPath} className="d-flex">
              <td className="text-break w-50">
                <a href={convertedPath}>
                  {convertedPath}
                </a>
              </td>
              <td className="text-break text-danger w-50">
                {existPath}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
