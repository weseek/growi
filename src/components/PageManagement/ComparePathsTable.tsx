import { VFC } from 'react';
import { useTranslation } from '~/i18n';
import { Page } from '~/interfaces/page';

import { convertToNewAffiliationPath } from '~/utils/path-utils';

type Props = {
  currentPagePath: string,
  subordinatedPages: Page[],
  newPagePath: string,
}

export const ComparePathsTable:VFC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const {
    currentPagePath, subordinatedPages, newPagePath,
  } = props;

  return (
    <table className="table table-bordered grw-compare-paths-table">
      <thead>
        <tr className="d-flex">
          <th className="w-50">{t('original_path')}</th>
          <th className="w-50">{t('new_path')}</th>
        </tr>
      </thead>
      <tbody className="overflow-auto d-block">
        {subordinatedPages.map((subordinatedPage) => {
          const convertedPath = convertToNewAffiliationPath(currentPagePath, newPagePath, subordinatedPage.path);
          return (
            <tr key={subordinatedPage._id} className="d-flex">
              <td className="text-break w-50">
                <a href={subordinatedPage.path}>
                  {subordinatedPage.path}
                </a>
              </td>
              <td className="text-break w-50">
                {convertedPath}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
