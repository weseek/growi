import React, { FC, useState } from 'react';
import SearchResultListItem from './SearchResultListItem';
import PaginationWrapper from '../PaginationWrapper';
import PageRenameModal from '../PageRenameModal';
import PageDuplicateModal from '../PageDuplicateModal';
import { IPageSearchResultData } from '../../interfaces/search';


const PageDuplicateModalWrapper = (props) => {
  return <PageDuplicateModal {...props}></PageDuplicateModal>;
};

const PageRenameModalWrapper = (props) => {
  return <PageRenameModal {...props}></PageRenameModal>;
};

type Props = {
  pages: IPageSearchResultData[],
  selectedPages: IPageSearchResultData[],
  onClickInvoked?: (pageId: string) => void,
  searchResultCount?: number,
  activePage?: number,
  pagingLimit?: number,
  onPagingNumberChanged?: (activePage: number) => void,
  focusedSearchResultData?: IPageSearchResultData,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const { focusedSearchResultData } = props;
  const [isPageDuplicateModalShown, setIsPageDuplicateModalShown] = useState(false);
  const [isPageRenameModalShown, setIsPageRenameModalShown] = useState(false);
  const [controlTargetPage, setControlTargetPage] = useState(focusedSearchResultData?.pageData || {
    _id: '',
    path: '',
    revision: '',
  });

  function openPageDuplicateModalHandler() {
    setIsPageDuplicateModalShown(true);
  }

  function closePageDuplicateModalHandler() {
    setIsPageDuplicateModalShown(false);
  }

  function openPageRenameModalHandler() {
    setIsPageRenameModalShown(true);
  }

  // TODO: Change the process that runs after the rename process is complete.
  function redirectToRenamedPage(page, options) {
    const { isRenameRedirect = false } = options;
    const url = new URL(page.path, 'https://dummy');
    url.searchParams.append('renamedFrom', controlTargetPage.path);
    if (isRenameRedirect) {
      url.searchParams.append('withRedirect', 'true');
    }

    window.location.href = `${url.pathname}${url.search}`;
  }

  function renderModals() {

    return (
      <>
        <PageRenameModalWrapper
          isOpen={isPageRenameModalShown}
          onClose={() => { setIsPageRenameModalShown(false) }}
          onRenameCompleted={redirectToRenamedPage}
          pageId={controlTargetPage._id}
          revisionId={controlTargetPage.revision}
          path={controlTargetPage.path}
        />
        <PageDuplicateModalWrapper
          isOpen={isPageDuplicateModalShown}
          onClose={closePageDuplicateModalHandler}
          pageId={controlTargetPage._id}
          path={controlTargetPage.path}
        />
        {/* TODO: call page delete modal
        <PageDeleteModalWrapper
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

  const focusedPageId = (focusedSearchResultData != null && focusedSearchResultData.pageData != null) ? focusedSearchResultData.pageData._id : '';
  return (
    <>
      {props.pages.map((page) => {
        return (
          <SearchResultListItem
            key={page.pageData._id}
            page={page}
            onClickInvoked={props.onClickInvoked}
            onClickControlDropdown={setControlTargetPage}
            onClickPageDuplicateBtnInvoked={openPageDuplicateModalHandler}
            onClickPageRenameBtnInvoked={openPageRenameModalHandler}
            isSelected={page.pageData._id === focusedPageId || false}
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
