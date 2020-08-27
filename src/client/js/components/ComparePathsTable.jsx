import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import PageContainer from '../services/PageContainer';
import { convertToNewAffiliationPath } from '../../../lib/util/path-utils';

function ComparePathsTable(props) {
  const {
    subordinatedPages, pageContainer, newPagePath, t,
  } = props;
  const { path } = pageContainer.state;

  return (
    <table className="table table-bordered compare-page-tabel">
      <thead>
        <tr>
          <th className="w-50">{t('original_path')}</th>
          <th className="w-50">{t('new_path')}</th>
        </tr>
      </thead>
      <tbody>
        {subordinatedPages.map((subordinatedPage) => {
          const convertedPath = convertToNewAffiliationPath(path, newPagePath, subordinatedPage.path);
          return (
            <tr key={subordinatedPage._id}>
              <td className="text-break">
                <a href={subordinatedPage.path}>
                  {subordinatedPage.path}
                </a>
              </td>
              <td className="text-break">
                {convertedPath}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}


/**
 * Wrapper component for using unstated
 */
const PageDuplicateModallWrapper = withUnstatedContainers(ComparePathsTable, [PageContainer]);

ComparePathsTable.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  subordinatedPages: PropTypes.array.isRequired,
  newPagePath: PropTypes.string.isRequired,
};


export default withTranslation()(PageDuplicateModallWrapper);
