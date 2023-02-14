import React from 'react';

import { pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';


const { convertToNewAffiliationPath } = pagePathUtils;

function DuplicatedPathsTable(props) {
  const { t } = useTranslation();

  const {
    fromPath, toPath, existingPaths,
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
          const convertedPath = convertToNewAffiliationPath(toPath, fromPath, existPath);
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
  existingPaths: PropTypes.array.isRequired,
  fromPath: PropTypes.string.isRequired,
  toPath: PropTypes.string.isRequired,
};


export default DuplicatedPathsTable;
