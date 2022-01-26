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
      {/* Todo: show alert */}

      {/* identical page list */}
      <div className="page-list">
        <ul className="page-list-ul list-group-flush border px-3">
          {pageDataList.map((data) => {
            return (
              <PageListItem
                key={data.pageData._id}
                page={data}
                isSelected={false}
                isChecked={false}
                isEnableActions
                shortBody={shortbodyMap[data.pageData._id]}
              // Todo: add onClickDeleteButton when delete feature implemented
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default withUnstatedContainers(IdenticalPathPage, [AppContainer]);
