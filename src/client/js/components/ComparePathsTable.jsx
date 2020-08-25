import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';


function ComparePathsTable(props) {
  const { subordinatedPages } = props;
  return (
    <table className="table table-bordered">
      <tbody>
        <tr>
          <th>元のパス</th>
          <th>新しいパス</th>
        </tr>
        <tr>
          <td>
            <ul className="duplicate-name">
              {subordinatedPages.map((subordinatedPath) => {
              return (
                <li key={subordinatedPath._id}>
                  <a href={subordinatedPath.path}>
                    {subordinatedPath.path}
                  </a>
                </li>
              );
            })}
            </ul>
          </td>
          <td>testPath/huga</td>
        </tr>
      </tbody>
    </table>
  );
}

ComparePathsTable.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  subordinatedPages: PropTypes.array.isRequired,
};


export default withTranslation()(ComparePathsTable);
