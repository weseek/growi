import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { pagePathUtils } from '@growi/core';

const { convertToNewAffiliationPath } = pagePathUtils;

function DuplicatedPathsTable(props) {
  const {
    path, oldPagePath, existingPaths, t,
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
}

DuplicatedPathsTable.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  existingPaths: PropTypes.array.isRequired,
  path: PropTypes.string.isRequired,
  oldPagePath: PropTypes.string.isRequired,
};


export default withTranslation()(DuplicatedPathsTable);
