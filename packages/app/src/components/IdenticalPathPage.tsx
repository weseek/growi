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
  const identicalPageDocument = document.getElementById('identical-path-page');
  const pageDataList = JSON.parse(identicalPageDocument?.getAttribute('data-identical-page-data-list') || jsonNull);
  const shortbodyMap = JSON.parse(identicalPageDocument?.getAttribute('data-shortody-map') || jsonNull);

  return (
    <>
      {/* Todo: show alert */}

      {/* identical page list */}
      <div className="d-flex flex-column flex-lg-row-reverse">

        <div className="grw-side-contents-container">
          <div className="grw-side-contents-sticky-container">
            <div className="border-bottom pb-1">
              {/* <PageAccessories isNotFoundPage={!isPageExist} /> */}
            </div>
          </div>
        </div>

        <div className="flex-grow-1 flex-basis-0 mw-0">
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

      </div>
    </>
  );
};

export default withUnstatedContainers(IdenticalPathPage, [AppContainer]);
