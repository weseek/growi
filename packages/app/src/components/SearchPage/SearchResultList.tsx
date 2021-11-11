import React, { FC, useState } from 'react';
import SearchResultListItem from './SearchResultListItem';
import { IPageHasId } from '../../interfaces/page';
import PaginationWrapper from '../PaginationWrapper';
import PageRenameModal from '../PageRenameModal';

// TOOD: retrieve bookmark count and add it to the following type
export type ISearchedPage = IPageHasId & {
  snippet: string,
  elasticSearchResult: {
    snippet: string,
    matchedPath: string,
  },
};

type Props = {
  pages: ISearchedPage[],
  selectedPages: ISearchedPage[],
  onClickInvoked?: (pageId: string) => void,
  searchResultCount?: number,
  activePage?: number,
  pagingLimit?: number,
  onPagingNumberChanged?: (activePage: number) => void,
  focusedPage?: ISearchedPage,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const { focusedPage } = props;
  const focusedPageId = focusedPage != null && focusedPage._id != null ? focusedPage._id : '';

  const [isPageRenameModalShown, setIsPageRenameModalShown] = useState(false);
  const [controlTargetPage, setControlTargetPage] = useState(focusedPage || {
    _id: null,
    path: null,
    revision: {
      _id: null,
    },
  });

  function openPageRenameModalHandler() {
    setIsPageRenameModalShown(true);
  }

  function renderModals() {

    return (
      <>
        <PageRenameModal
          isOpen={isPageRenameModalShown}
          onClose={() => { setIsPageRenameModalShown(false) }}
          pageId={controlTargetPage._id}
          revisionId={controlTargetPage.revision._id}
          path={controlTargetPage.path}
        />
        {/* <PageDuplicateModal
          isOpen={isPageDuplicateModalShown}
          onClose={closePageDuplicateModalHandler}
          pageId={pageId}
          path={path}
        /> */}
        {/* <PageDeleteModal
          isOpen={isPageDeleteModalShown}
          onClose={closePageDeleteModalHandler}
          pageId={pageId}
          revisionId={revisionId}
          path={path}
          isAbleToDeleteCompletely={isAbleToDeleteCompletely}
        /> */}
      </>
    );
  }

  return (
    <>
      {props.pages.map((page) => {
        return (
          <SearchResultListItem
            key={page._id}
            page={page}
            onClickInvoked={props.onClickInvoked}
            onClickControlDropdown={setControlTargetPage}
            onClickPageRenameBtnInvoked={openPageRenameModalHandler}
            isSelected={page._id === focusedPageId || false}
          />
        );
      })}
      {props.searchResultCount != null && props.searchResultCount > 0 && (
        <div className="my-4 mx-auto">
          <PaginationWrapper
            activePage={props.activePage || 1}
            changePage={props.onPagingNumberChanged}
            totalItemsCount={props.searchResultCount || 0}
            pagingLimit={props.pagingLimit}
          />
        </div>
      )}
      { renderModals() }
    </>
  );

};

export default SearchResultList;
