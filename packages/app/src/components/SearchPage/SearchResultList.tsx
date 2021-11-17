import React, { FC, useState } from 'react';
import SearchResultListItem from './SearchResultListItem';
import PaginationWrapper from '../PaginationWrapper';
import PageRenameModal from '../PageRenameModal';
import { IPageSearchResultData } from '../../interfaces/search';


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
  focusedPage?: IPageSearchResultData,
}

const SearchResultList: FC<Props> = (props:Props) => {
  const { focusedPage } = props;
  const [isPageRenameModalShown, setIsPageRenameModalShown] = useState(false);
  const [controlTargetPage, setControlTargetPage] = useState(focusedPage?.pageData || {
    _id: '',
    path: '',
    revision: '',
  });

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
        {/* TODO: call page duplicate modal
        <PageDuplicateModalWrapper
          isOpen={isPageDuplicateModalShown}
          onClose={closePageDuplicateModalHandler}
          pageId={pageId}
          path={path}
        /> */}
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

  const focusedPageId = (focusedPage !== undefined && focusedPage.pageData !== undefined) ? focusedPage.pageData._id : '';
  return (
    <>
      {props.pages.map((page) => {
        return (
          <SearchResultListItem
            key={page.pageData._id}
            page={page}
            onClickInvoked={props.onClickInvoked}
            onClickControlDropdown={setControlTargetPage}
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
