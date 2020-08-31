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
    <table className="table table-bordered grw-compare-page-table">
      <thead>
        <tr className="d-flex">
          <th className="w-50">{t('original_path')}</th>
          <th className="w-50">{t('new_path')}</th>
        </tr>
      </thead>
      <tbody className="overflow-auto d-block">
        {subordinatedPages.map((subordinatedPage) => {
          const convertedPath = convertToNewAffiliationPath(path, newPagePath, subordinatedPage.path);
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
