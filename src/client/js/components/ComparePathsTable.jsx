import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import PageContainer from '../services/PageContainer';
import { convertToNewAffiliationPath } from '../../../lib/util/path-utils';

function ComparePathsTable(props) {
  const { subordinatedPages, pageContainer, newPagePath } = props;
  const { path } = pageContainer.state;

  return (
    <table className="table table-bordered">
      <tbody>
        <tr>
          {/* TODO i18n */}
          <th className="w-50">元のパス</th>
          <th className="w-50">新しいパス</th>
        </tr>
        <tr>
          <td>
            <ul className="list-unstyled">
              {subordinatedPages.map((subordinatedPage) => {
              return (
                <li key={subordinatedPage._id}>
                  <a href={subordinatedPage.path}>
                    {subordinatedPage.path}
                  </a>
                </li>
              );
            })}
            </ul>
          </td>
          <td>
            <ul className="list-unstyled">
              {subordinatedPages.map((subordinatedPage) => {
                const convertedPath = convertToNewAffiliationPath(path, newPagePath, subordinatedPage.path);
                return (
                  <li key={subordinatedPage._id}>
                    {convertedPath}
                  </li>
                );
              })}
            </ul>
          </td>
        </tr>
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
