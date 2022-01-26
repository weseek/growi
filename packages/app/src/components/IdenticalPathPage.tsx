import React, {
  FC,
} from 'react';

import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import PageListItem from './Page/PageListItem';

type IdenticalPathPageProps= {
  // add props and types here
}
const jsonNull = 'null';

const IdenticalPathPage:FC<IdenticalPathPageProps> = (props:IdenticalPathPageProps) => {
  const identicalPageDocument = document.getElementById('identical-path-page-list');
  const pageDataList = JSON.parse(identicalPageDocument?.getAttribute('data-identical-page-data-list') || jsonNull);
  const shortbodyMap = JSON.parse(identicalPageDocument?.getAttribute('data-shortody-map') || jsonNull);

  return (
    <div className="container">
      <ul className="list-group">
        {/* Todo: show alert */}
        {pageDataList.map((data) => {
          return (
            <PageListItem
              key={data.pageData._id}
              page={data} // need this to have valid userpicture
              isSelected={false}
              isChecked={false}
              isEnableActions={false}
              shortBody={shortbodyMap[data.pageData._id]}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default withUnstatedContainers(IdenticalPathPage, [AppContainer]);
