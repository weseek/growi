import React, {
  forwardRef, ForwardRefRenderFunction, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { ISelectableAll } from '~/client/interfaces/selectable-all';
import AppContainer from '~/client/services/AppContainer';
import { IPageWithMeta } from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';
import { useIsGuestUser, useIsSearchServiceConfigured, useIsSearchServiceReachable } from '~/stores/context';
import { ForceHideMenuItems } from '../Common/Dropdown/PageItemControl';

import { SearchResultContent } from '../SearchPage/SearchResultContent';
import { SearchResultList } from '../SearchPage/SearchResultList';

export interface IReturnSelectedItems {
  getItems(): IPageWithMeta<IPageSearchMeta>[],
}


type Props = {
  appContainer: AppContainer,

  pages?: IPageWithMeta<IPageSearchMeta>[],

  forceHideMenuItems?: ForceHideMenuItems,

  onSelectedPagesByCheckboxesChanged?: (selectedCount: number, totalCount: number) => void,

  searchControl: React.ReactNode,
  searchResultListHead: React.ReactNode,
  searchPager: React.ReactNode,
}

const SearchPageBaseSubstance: ForwardRefRenderFunction<ISelectableAll & IReturnSelectedItems, Props> = (props:Props, ref) => {
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
  const [selectedPagesByCheckboxes, setSelectedPagesByCheckboxes] = useState<Record<string, IPageWithMeta<IPageSearchMeta>>>({});
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
        pages.forEach((page) => {
          selectedPagesByCheckboxes[page.pageData._id] = page;
        });
      }
    },
    deselectAll: () => {
      const instance = searchResultListRef.current;
      if (instance != null) {
        instance.deselectAll();
      }

      setSelectedPagesByCheckboxes({});
    },
    getItems: () => {
      return Object.values(selectedPagesByCheckboxes);
    },
  }));

  const checkboxChangedHandler = (isChecked: boolean, pageId: string) => {
    if (pages == null || pages.length === 0) {
      return;
    }

    if (isChecked) {
      const page = pages.find(page => page.pageData._id === pageId);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      selectedPagesByCheckboxes[pageId] = page!;
    }
    else {
      delete selectedPagesByCheckboxes[pageId];
    }

    if (onSelectedPagesByCheckboxesChanged != null) {
      onSelectedPagesByCheckboxesChanged(Object.keys(selectedPagesByCheckboxes).length, pages.length);
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
      // clear
      setSelectedPagesByCheckboxes({});
    }

    if (onSelectedPagesByCheckboxesChanged != null) {
      onSelectedPagesByCheckboxesChanged(Object.keys(selectedPagesByCheckboxes).length, pages.length);
    }
  }, [onSelectedPagesByCheckboxesChanged, pages, selectedPagesByCheckboxes]);

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


export const SearchPageBase = forwardRef(SearchPageBaseSubstance);
