import React, { FC } from 'react';
import PageListItem from './PageListItem';
import { IPageSearchResultData } from '../../interfaces/search';


type Props = {
  pages: IPageSearchResultData[],
  isEnableActions: boolean,
  shortBodiesMap?: Record<string, string>,
  onClickCheckbox?: (pageId: string) => void,
  onClickDeleteButton?: (pageId: string) => void,
}

const PageList: FC<Props> = (props:Props) => {
  const {
    isEnableActions, shortBodiesMap,
  } = props;

  return (
    <>
      {Array.isArray(props.pages) && props.pages.map((page) => {

        return (
          <PageListItem
            key={page.pageData._id}
            page={page}
            isEnableActions={isEnableActions}
            shortBody={shortBodiesMap?.[page.pageData._id]}
            onClickCheckbox={props.onClickCheckbox}
            onClickDeleteButton={props.onClickDeleteButton}
            showPageUpdatedTime
          />
        );
      })}

    </>
  );

};

export default PageList;
