import React, {
  forwardRef, ForwardRefRenderFunction, useCallback, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectableAll } from '~/client/interfaces/selectable-all';
import AppContainer from '~/client/services/AppContainer';
import { toastSuccess } from '~/client/util/apiNotification';
import { IPageWithMeta } from '~/interfaces/page';
import { IFormattedSearchResult, IPageSearchMeta } from '~/interfaces/search';
import { OnDeletedFunction } from '~/interfaces/ui';
import { useIsGuestUser, useIsSearchServiceConfigured, useIsSearchServiceReachable } from '~/stores/context';
import { IPageForPageDeleteModal, usePageDeleteModal } from '~/stores/modal';
import { usePageTreeTermManager } from '~/stores/page-listing';
import { ForceHideMenuItems } from '../Common/Dropdown/PageItemControl';

import { SearchResultContent } from '../SearchPage/SearchResultContent';
import { SearchResultList } from '../SearchPage/SearchResultList';


export interface IReturnSelectedPageIds {
  getSelectedPageIds?: () => Set<string>,
}


type Props = {
  appContainer: AppContainer,

  pages?: IPageWithMeta<IPageSearchMeta>[],

  forceHideMenuItems?: ForceHideMenuItems,

  onSelectedPagesByCheckboxesChanged?: (selectedCount: number, totalCount: number) => void,

  searchControl: React.ReactNode,
  searchResultListHead: React.ReactElement,
  searchPager: React.ReactNode,
}

const SearchPageBaseSubstance: ForwardRefRenderFunction<ISelectableAll & IReturnSelectedPageIds, Props> = (props:Props, ref) => {
  const {
    appContainer,
    pages,
    forceHideMenuItems,
    onSelectedPagesByCheckboxesChanged,
    searchControl, searchResultListHead, searchPager,
  } = props;

  const searchResultListRef = useRef<ISelectableAll|null>(null);

  const { data: isGuestUser } = useIsGuestUser();
  const { data: isSearchServiceConfigured } = useIsSearchServiceConfigured();
  const { data: isSearchServiceReachable } = useIsSearchServiceReachable();

  // TODO get search keywords and split
  // ref: RevisionRenderer
  //   [...keywords.match(/"[^"]+"|[^\u{20}\u{3000}]+/ug)].forEach((keyword, i) => {
  const [highlightKeywords, setHightlightKeywords] = useState<string[]>([]);
  const [selectedPageIdsByCheckboxes] = useState<Set<string>>(new Set());
  // const [allPageIds] = useState<Set<string>>(new Set());
  const [selectedPageWithMeta, setSelectedPageWithMeta] = useState<IPageWithMeta<IPageSearchMeta> | undefined>();

  // publish selectAll()
  useImperativeHandle(ref, () => ({
    selectAll: () => {
      const instance = searchResultListRef.current;
      if (instance != null) {
        instance.selectAll();
      }

      if (pages != null) {
        pages.forEach(page => selectedPageIdsByCheckboxes.add(page.pageData._id));
      }
    },
    deselectAll: () => {
      const instance = searchResultListRef.current;
      if (instance != null) {
        instance.deselectAll();
      }

      selectedPageIdsByCheckboxes.clear();
    },
    getSelectedPageIds: () => {
      return selectedPageIdsByCheckboxes;
    },
  }));

  const checkboxChangedHandler = (isChecked: boolean, pageId: string) => {
    if (pages == null || pages.length === 0) {
      return;
    }

    if (isChecked) {
      selectedPageIdsByCheckboxes.add(pageId);
    }
    else {
      selectedPageIdsByCheckboxes.delete(pageId);
    }

    if (onSelectedPagesByCheckboxesChanged != null) {
      onSelectedPagesByCheckboxesChanged(selectedPageIdsByCheckboxes.size, pages.length);
    }
  };

  // select first item on load
  useEffect(() => {
    if (selectedPageWithMeta == null && pages != null && pages.length > 0) {
      setSelectedPageWithMeta(pages[0]);
    }
  }, [pages, selectedPageWithMeta]);

  // reset selectedPageIdsByCheckboxes
  useEffect(() => {
    if (pages == null) {
      return;
    }

    if (pages.length > 0) {
      selectedPageIdsByCheckboxes.clear();
    }

    if (onSelectedPagesByCheckboxesChanged != null) {
      onSelectedPagesByCheckboxesChanged(selectedPageIdsByCheckboxes.size, pages.length);
    }
  }, [onSelectedPagesByCheckboxesChanged, pages, selectedPageIdsByCheckboxes]);

  useEffect(() => {
    if (searchResultListHead != null && searchResultListHead.props != null) {
      setHightlightKeywords(searchResultListHead.props.searchingKeyword);
    }
  }, [searchResultListHead]);
  if (!isSearchServiceConfigured) {
    return (
      <div className="grw-container-convertible">
        <div className="row mt-5">
          <div className="col text-muted">
            <h1>Search service is not configured in this system.</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!isSearchServiceReachable) {
    return (
      <div className="grw-container-convertible">
        <div className="row mt-5">
          <div className="col text-muted">
            <h1>Search service occures errors. Please contact to administrators of this system.</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-main">
      <div className="search-result-base d-flex" data-testid="search-result-base">

        <div className="mw-0 flex-grow-1 flex-basis-0 border boder-gray search-result-list" id="search-result-list">

          {searchControl}

          <div className="search-result-list-scroll">

            {/* Loading */}
            { pages == null && (
              <div className="mw-0 flex-grow-1 flex-basis-0 m-5 text-muted text-center">
                <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
              </div>
            ) }

            {/* Loaded */}
            { pages != null && (
              <>
                <div className="my-3 px-md-4 px-3">
                  {searchResultListHead}
                </div>

                { pages.length > 0 && (
                  <div className="page-list px-md-4">
                    <SearchResultList
                      ref={searchResultListRef}
                      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      pages={pages!}
                      selectedPageId={selectedPageWithMeta?.pageData._id}
                      forceHideMenuItems={forceHideMenuItems}
                      onPageSelected={page => setSelectedPageWithMeta(page)}
                      onCheckboxChanged={checkboxChangedHandler}
                    />
                  </div>
                ) }
                <div className="my-4 d-flex justify-content-center">
                  {searchPager}
                </div>
              </>
            ) }

          </div>

        </div>

        <div className="mw-0 flex-grow-1 flex-basis-0 d-none d-lg-block search-result-content">
          { selectedPageWithMeta != null && (
            <SearchResultContent
              appContainer={appContainer}
              pageWithMeta={selectedPageWithMeta}
              highlightKeywords={highlightKeywords}
              showPageControlDropdown={!isGuestUser}
              forceHideMenuItems={forceHideMenuItems}
            />
          )}
        </div>

      </div>
    </div>
  );
};


type VoidFunction = () => void;

export const usePageDeleteModalForBulkDeletion = (
    data: IFormattedSearchResult | undefined,
    ref: React.MutableRefObject<(ISelectableAll & IReturnSelectedPageIds) | null>,
    onDeleted?: OnDeletedFunction,
): VoidFunction => {

  const { t } = useTranslation();

  const { open: openDeleteModal } = usePageDeleteModal();

  // for PageTree mutation
  const { advance: advancePt } = usePageTreeTermManager();

  return () => {
    if (data == null) {
      return;
    }

    const instance = ref.current;
    if (instance == null || instance.getSelectedPageIds == null) {
      return;
    }

    const selectedPageIds = instance.getSelectedPageIds();

    if (selectedPageIds.size === 0) {
      return;
    }

    const selectedPages = data.data
      .filter(pageWithMeta => selectedPageIds.has(pageWithMeta.pageData._id))
      .map(pageWithMeta => ({
        pageId: pageWithMeta.pageData._id,
        path: pageWithMeta.pageData.path,
        revisionId: pageWithMeta.pageData.revision as string,
      } as IPageForPageDeleteModal));

    openDeleteModal(selectedPages, {
      onDeleted: (...args) => {
        toastSuccess(args[2] ? t('deleted_pages_completely') : t('deleted_pages'));
        advancePt();

        if (onDeleted != null) {
          onDeleted(...args);
        }
      },
    });
  };

};


export const SearchPageBase = forwardRef(SearchPageBaseSubstance);
