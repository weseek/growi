import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import escapeStringRegexp from 'escape-string-regexp';
import { withUnstatedContainers } from './UnstatedUtils';

import PageContainer from '../services/PageContainer';

function ComparePathsTable(props) {
  const { subordinatedPages, pageContainer } = props;
  const { path } = pageContainer.state;

  // Dummy
  const newPagePathPrefix = 'huga';

  return (
    <table className="table table-bordered">
      <tbody>
        <tr>
          {/* TODO i18n */}
          <th>元のパス</th>
          <th>新しいパス</th>
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
              const pathRegExp = new RegExp(`^${escapeStringRegexp(path)}`, 'i');
              const newPagePath = subordinatedPage.path.replace(pathRegExp, newPagePathPrefix);
              return (
                <li key={subordinatedPage._id}>
                  /{newPagePath}
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
};


export default withTranslation()(PageDuplicateModallWrapper);
